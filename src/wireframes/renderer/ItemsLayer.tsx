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

    const nestedRootIds = diagrams.map(d=>d.rootIds);
    const itemIds =  React.useMemo(()=> new ImmutableList<string>(nestedRootIds.flatMap(x=>x.values)), [nestedRootIds]);
    const itemMaps = diagrams.map(d=>d.items);
    const items = React.useMemo(()=> new Map<string, DiagramItem>(itemMaps.flatMap(map=>map.entries)), [itemMaps]);

    const orderedShapes = React.useMemo(() => {
        const flattenShapes: DiagramItem[] = [];

        if (items && itemIds) {
            let handleContainer: (itemIds: ImmutableList<string>) => any;

            // eslint-disable-next-line prefer-const
            handleContainer = itemIds => {
                for (const id of itemIds.values) {
                    const item = items.get(id);

                    if (item) {
                        if (item.type === 'Shape') {
                            flattenShapes.push(item);
                        }

                        if (item.type === 'Group') {
                            handleContainer(item.childIds);
                        }
                    }
                }
            };

            handleContainer(itemIds);
        }

        return flattenShapes;
    }, [itemIds, items]);

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

    private render() {
        this.engineItem.plot(this.shapePreview || this.shapeStatic);
    }
}
