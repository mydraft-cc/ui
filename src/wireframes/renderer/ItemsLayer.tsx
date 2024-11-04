/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { ImmutableList, Subscription } from '@app/core';
import { EngineItem, EngineLayer } from '@app/wireframes/engine';
import { Diagram, DiagramItem, PluginRegistry } from '@app/wireframes/model';
import { PreviewEvent } from './preview';

export interface ItemsLayerProps {
    // The selected diagram.
    diagram?: Diagram;

    // The container to render on.
    diagramLayer: EngineLayer;

    // The preview subscription.
    preview?: Subscription<PreviewEvent>;

    // True when rendered.
    onRender?: () => void;
}

export const ItemsLayer = React.memo((props: ItemsLayerProps) => {
    const {
        diagram,
        diagramLayer,
        onRender,
        preview,
    } = props;

    const shapesRendered = React.useRef(onRender);
    const shapeRefsById = React.useRef<{ [id: string]: EngineItem }>({});

    const itemIds = diagram?.rootIds;
    const items = diagram?.items;

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

                references[shape.id] = diagramLayer.item(plugin);
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
                ref.remove();
            }
        }

        for (const shape of allShapes) {
            references[shape.id].invalidate(shape);
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
