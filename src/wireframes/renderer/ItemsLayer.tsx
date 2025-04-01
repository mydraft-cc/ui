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

    // The DESIGN theme state.
    designThemeMode: 'light' | 'dark';

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
        designThemeMode,
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
            // ** Update the theme mode for the item **
            references[shape.id].updateThemeMode(designThemeMode);
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
    }, [diagramLayer, orderedShapes, designThemeMode]);
    
    // Create a function to force re-render all shapes without using hooks inside
    const forceRerenderAllShapes = React.useCallback(() => {
        const references = shapeRefsById.current;
        
        // Create the debounced function if not exists
        if (!debouncerRef.current) {
            debouncerRef.current = debounced((shapes: DiagramItem[], currentDesignTheme: 'light' | 'dark') => {
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
                            // ** Pass theme to forceRerender **
                            references[shape.id].forceRerender(shape, currentDesignTheme);
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
        
        // ** Pass current theme to debounced function **
        debouncerRef.current(orderedShapes, designThemeMode);
    }, [orderedShapes, designThemeMode]);
    
    // Add a separate effect specifically for theme changes to force re-render of all shapes
    React.useEffect(() => {
        // When designThemeMode changes directly through prop, force an immediate re-render
        forceRerenderAllShapes();

        // --- Remove listener logic --- 
        // Also set up a listener for theme changes that might happen outside React's flow
        // NOTE: This external listener might become redundant or need adjustment
        // after ThemeShapeUtils is refactored in Phase 4, but leave it for now.
        // const unsubscribe = addThemeChangeListener(() => {
        //     forceRerenderAllShapes();
        // });
        //
        // return unsubscribe;
        // --- End remove listener logic ---

    }, [designThemeMode, forceRerenderAllShapes]);

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
    private currentDesignThemeMode: 'light' | 'dark' = 'light'; // Store the theme

    constructor(
        private readonly engineItem: EngineItem,
    ) {
    }

    // Method to update the theme
    public updateThemeMode(mode: 'light' | 'dark') {
        this.currentDesignThemeMode = mode;
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

    public forceRerender(shape: DiagramItem, designThemeMode: 'light' | 'dark') {
        this.currentDesignThemeMode = designThemeMode; // Update stored theme
        const context = { designThemeMode: this.currentDesignThemeMode }; // Prepare context

        if (this.engineItem && typeof this.engineItem.forceReplot === 'function') {
            // Pass context as second argument
            this.engineItem.forceReplot(shape, context);
            return true;
        }
        
        // Fallback to standard plot
        this.plot(shape);
        return false;
    }

    private render() {
        const shapeToRender = this.shapePreview || this.shapeStatic;
        if (shapeToRender) {
            const context = { designThemeMode: this.currentDesignThemeMode }; // Prepare context
            // Pass context as second argument
            this.engineItem.plot(shapeToRender, context);
        }
    }
}
