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
import { reorder } from './reorder';

export interface ItemsLayerProps {
    // The selected diagram.
    diagrams: Diagram[];

    // The container to render on.
    diagramLayer: EngineLayer;

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
    } = props;

    const shapesRendered = React.useRef(onRender);
    const shapeRefsById = React.useRef<Record<string, ItemWithPreview>>({});
    const renderedIds = React.useRef<string[]>([]);

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

        const currentIds = renderedIds.current.filter(id => !!references[id]);

        // Create missing shapes. The engine appends new items to the end of the layer.
        for (const shape of allShapes) {
            if (!references[shape.id]) {
                const plugin = PluginRegistry.get(shape.renderer)?.plugin;

                if (!plugin) {
                    throw new Error(`Cannot find renderer for ${shape.renderer}.`);
                }

                references[shape.id] = new ItemWithPreview(diagramLayer.item(plugin));
                currentIds.push(shape.id);
            }
        }

        for (const shape of allShapes) {
            references[shape.id].plot(shape);
        }

        const desiredIds = allShapes.map(x => x.id);

        reorder(currentIds, desiredIds, (id, nextId) => {
            references[id].moveBefore(nextId ? references[nextId] : null);
        });

        renderedIds.current = desiredIds;

        if (shapesRendered.current) {
            shapesRendered.current();
        }
    }, [diagramLayer, orderedShapes]);

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

    public moveBefore(next: ItemWithPreview | null) {
        this.engineItem.moveBefore(next?.engineItem ?? null);
    }
    
    public remove() {
        this.engineItem.remove();
    }

    private render() {
        this.engineItem.plot(this.shapePreview || this.shapeStatic);
    }
}
