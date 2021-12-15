/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Diagram, DiagramContainer, DiagramItem, RendererService } from '@app/wireframes/model';
import * as React from 'react';
import * as svg from '@svgdotjs/svg.js';
import { ShapeRef } from './shape-ref';

export interface RenderLayerProps {
    // The renderer service.
    rendererService: RendererService;

    // The selected diagram.
    diagram?: Diagram;

    // The container to render on.
    renderContainer: svg.Container;

    // The preview items.
    previewItems?: ReadonlyArray<DiagramItem>;

    // True when rendered.
    onRender?: () => void;
}

const showDebugOutlines = process.env.NODE_ENV === 'false';

export const RenderLayer = React.memo((props: RenderLayerProps) => {
    const {
        diagram,
        previewItems,
        renderContainer,
        rendererService,
        onRender,
    } = props;

    const shapesRendered = React.useRef(onRender);
    const shapeRefsById = React.useRef<{ [id: string]: ShapeRef }>({});

    const orderedShapes = React.useMemo(() => {
        const flattenShapes: DiagramItem[] = [];

        if (diagram) {
            let handleContainer: (itemIds: DiagramContainer) => any;

            // eslint-disable-next-line prefer-const
            handleContainer = itemIds => {
                for (const id of itemIds.values) {
                    const item = diagram.items.get(id);

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

            handleContainer(diagram.itemIds);
        }

        return flattenShapes;
    }, [diagram]);

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
                const renderer = rendererService.registeredRenderers[shape.renderer];

                references[shape.id] = new ShapeRef(renderContainer, renderer, showDebugOutlines);
            }
        }

        let hasIdChanged = false;

        allShapes.forEach((shape, i) => {
            if (!references[shape.id].checkIndex(i)) {
                hasIdChanged = true;
            }
        });

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
    }, [renderContainer, orderedShapes, rendererService.registeredRenderers]);

    React.useEffect(() => {
        if (previewItems) {
            for (const item of previewItems) {
                shapeRefsById.current[item.id]?.setPreview(item);
            }
        } else {
            for (const reference of Object.values(shapeRefsById.current)) {
                reference.setPreview(null);
            }
        }
    }, [previewItems]);

    return null;
});
