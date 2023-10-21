/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import * as React from 'react';
import { ImmutableList, Subscription } from '@app/core';
import { Diagram, DiagramItem, RendererService } from '@app/wireframes/model';
import { PreviewEvent } from './preview';
import { ShapeRef } from './shape-ref';

export interface RenderLayerProps {
    // The selected diagram.
    diagram?: Diagram;

    // The container to render on.
    diagramLayer: svg.Container;

    // The preview subscription.
    preview?: Subscription<PreviewEvent>;

    // True when rendered.
    onRender?: () => void;
}

const showDebugOutlines = false;

export const RenderLayer = React.memo((props: RenderLayerProps) => {
    const {
        diagram,
        diagramLayer,
        preview,
        onRender,
    } = props;

    const shapesRendered = React.useRef(onRender);
    const shapeRefsById = React.useRef<{ [id: string]: ShapeRef }>({});

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
                const rendererInstance = RendererService.get(shape.renderer);

                if (!rendererInstance) {
                    throw new Error(`Cannot find renderer for ${shape.renderer}.`);
                }

                references[shape.id] = new ShapeRef(diagramLayer, rendererInstance, showDebugOutlines);
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
            references[shape.id].render(shape);
        }

        if (shapesRendered.current) {
            shapesRendered.current();
        }
    }, [diagramLayer, orderedShapes]);

    React.useEffect(() => {
        return preview?.subscribe(event => {
            if (event.type === 'Update') {
                for (const item of Object.values(event.items)) {
                    shapeRefsById.current[item.id]?.setPreview(item);
                }
            } else {
                for (const reference of Object.values(shapeRefsById.current)) {
                    reference.setPreview(null);
                }
            }
        });
    }, [preview]);

    return null;
});
