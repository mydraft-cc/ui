/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { ImmutableList,  Subscription } from '@app/core';
import { EngineItem, EngineLayer } from '@app/wireframes/engine';
import { Diagram, DiagramItem, PluginRegistry } from '@app/wireframes/model';
import { addThemeChangeListener } from '../shapes/neutral/ThemeShapeUtils';
import { PreviewEvent } from './preview';

// Helper function for debouncing - defined outside of component
function debounced(fn: Function, delay: number) {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
}

export interface ItemsLayerProps {
    // The selected diagram.
    diagrams: Diagram[];

    // The container to render on.
    diagramLayer: EngineLayer;

    // The theme state.
    isDarkMode?: boolean;

    // The preview subscription.
    preview?: Subscription<PreviewEvent>;

    // True when rendered.
    onRender?: () => void;
}

export const ItemsLayer = React.memo((props: ItemsLayerProps) => {
    const {
        diagrams,
        diagramLayer,
        onRender,
        preview,
        isDarkMode,
    } = props;

    const shapesRendered = React.useRef(onRender);
    const shapeRefsById = React.useRef<Record<string, ItemWithPreview>>({});
    const debouncerRef = React.useRef<ReturnType<typeof debounced> | null>(null);

    const orderedShapes = React.useMemo(() => {
        const result: DiagramItem[] = [];

        for (const diagram of diagrams) {
            const handleContainer: (itemIds: ImmutableList<string>) => void 
            = itemIds => {
                for (const id of itemIds.values) {
                    const item = diagram.items.get(id);

                    if (item) {
                        if (item.type === 'Shape') {
                            result.push(item);
                        }

                        if (item.type === 'Group') {
                            handleContainer(item.childIds);
                        }
                    }
                }
            };

            handleContainer(diagram.rootIds);
        }

        return result;
    }, [diagrams]);

    React.useEffect(() => {
        const allShapesById: { [id: string]: boolean } = {};
        const allShapes = orderedShapes;

        allShapes.forEach(item => {
            allShapesById[item.id] = true;
        });

        const references = shapeRefsById.current;

        // Delete old shapes.
        for (const [id, ref] of Object.entries(references)) {
            if (!allShapesById[id]) {
                ref.remove();

                delete references[id];
            }
        }

        // Create missing shapes.
        for (const shape of allShapes) {
            if (!references[shape.id]) {
                const plugin = PluginRegistry.get(shape.renderer)?.plugin;

                if (!plugin) {
                    throw new Error(`Cannot find renderer for ${shape.renderer}.`);
                }

                references[shape.id] = new ItemWithPreview(diagramLayer.item(plugin));
            }
        }

        let hasIdChanged = false;
        for (let i = 0; i < allShapes.length; i++) {
            if (!references[allShapes[i].id].checkIndex(i)) {
                hasIdChanged = true;
                break;
            }
        }

        // If the index of at least once shape has changed we have to remove them all to render them in the correct order.
        if (hasIdChanged) {
            for (const ref of Object.values(references)) {
                ref.detach();
            }
        }

        for (const shape of allShapes) {
            references[shape.id].plot(shape);
        }

        if (shapesRendered.current) {
            shapesRendered.current();
        }
    }, [diagramLayer, orderedShapes]);
    
    // Create a function to force re-render all shapes without using hooks inside
    const forceRerenderAllShapes = React.useCallback(() => {
        const references = shapeRefsById.current;
        console.debug(`ItemsLayer: Re-rendering ${orderedShapes.length} shapes due to theme change`);
        
        // Create the debounced function if not exists
        if (!debouncerRef.current) {
            debouncerRef.current = debounced((shapes: DiagramItem[]) => {
                // Use batched updates to prevent excessive repaints
                let count = 0;
                const batchSize = 10; // Number of shapes to update in each animation frame
                const totalShapes = shapes.length;
                
                const processBatch = () => {
                    const startIdx = count;
                    const endIdx = Math.min(count + batchSize, totalShapes);
                    
                    // Process a batch of shapes
                    for (let i = startIdx; i < endIdx; i++) {
                        const shape = shapes[i];
                        if (references[shape.id]) {
                            references[shape.id].forceRerender(shape);
                        }
                    }
                    
                    count += batchSize;
                    
                    // If more batches need processing, schedule next batch
                    if (count < totalShapes) {
                        requestAnimationFrame(processBatch);
                    } else {
                        // All shapes processed, notify render complete
                        if (shapesRendered.current) {
                            shapesRendered.current();
                        }
                    }
                };
                
                // Start batch processing
                processBatch();
            }, 100);
        }
        
        // Call the debounced function with current shapes
        debouncerRef.current(orderedShapes);
    }, [orderedShapes]);
    
    // Add a separate effect specifically for theme changes to force re-render of all shapes
    React.useEffect(() => {
        // When isDarkMode changes directly through prop, force an immediate re-render
        forceRerenderAllShapes();
        
        // Also set up a listener for theme changes that might happen outside React's flow
        const unsubscribe = addThemeChangeListener((theme) => {
            // When theme changes through ThemeShapeUtils, force re-render
            console.debug(`ItemsLayer: Theme changed to ${theme}, triggering shape re-render`);
            forceRerenderAllShapes();
        });
        
        return unsubscribe;
    }, [isDarkMode, forceRerenderAllShapes]);

    React.useEffect(() => {
        return preview?.subscribe(event => {
            if (event.type === 'Update') {
                for (const item of Object.values(event.items)) {
                    shapeRefsById.current[item.id]?.preview(item);
                }
            } else {
                for (const reference of Object.values(shapeRefsById.current)) {
                    reference.preview(null);
                }
            }
        });
    }, [preview]);

    return null;
});

class ItemWithPreview {
    private shapePreview: DiagramItem | null = null;
    private shapeStatic: DiagramItem | null = null;
    private currentIndex = -1;

    constructor(
        private readonly engineItem: EngineItem,
    ) {
    }

    public plot(shape: DiagramItem) {
        this.shapeStatic = shape;
        this.shapePreview = null;
        this.render();
    }

    public preview(shape: DiagramItem | null) {
        this.shapePreview = shape;
        this.render();
    }

    public checkIndex(index: number) {
        const result = this.currentIndex >= 0 && this.currentIndex !== index;

        this.currentIndex = index;
        return result;
    }

    public detach() {
        this.engineItem.detach();
    }
    
    public remove() {
        this.engineItem.remove();
    }

    public forceRerender(shape: DiagramItem) {
        // Use the proper interface method to force replotting
        if (this.engineItem && typeof this.engineItem.forceReplot === 'function') {
            this.engineItem.forceReplot(shape);
            return true;
        }
        
        // Fallback to standard plot if forceReplot is not available
        this.plot(shape);
        return false;
    }

    private render() {
        this.engineItem.plot(this.shapePreview || this.shapeStatic);
    }
}
