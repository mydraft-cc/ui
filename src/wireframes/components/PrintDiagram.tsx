/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Color, ImmutableMap, Rect2, Vec2 } from '@app/core';
import { Diagram, RendererService } from '@app/wireframes/model';
import { Editor } from '@app/wireframes/renderer/Editor';
import * as React from 'react';

export interface PrintDiagramProps {
    // The diagram.
    diagram: Diagram;

    // All diagrams.
    diagrams: ImmutableMap<Diagram>;

    // The diagram size.
    size: Vec2;

    // The color.
    color: Color;

    // The renderer.
    rendererService: RendererService;

    // True if the bounds should be used as size.
    useBounds?: boolean;

    // True when rendered.
    onRender?: (diagram: Diagram) => void;
}

export const PrintDiagram = (props: PrintDiagramProps) => {
    const {
        color,
        diagram,
        diagrams,
        rendererService,
        onRender,
        size,
        useBounds,
    } = props;

    const doOnRender = React.useCallback(() => {
        if (onRender) {
            onRender(diagram);
        }
    }, [diagram, onRender]);

    const { bounds, zoomedSize } = React.useMemo(() => {
        let bounds: Rect2;

        if (useBounds) {
            const aabbs = diagram.items.values.map(x => x.bounds(diagram).aabb);

            bounds = Rect2.fromRects(aabbs).inflate(20);
        } else {
            bounds = new Rect2(0, 0, size.x, size.y);
        }

        return { bounds, zoomedSize: new Vec2(bounds.w, bounds.h) };
    }, [diagram, size, useBounds]);

    return (
        <>
            <Editor
                color={color}
                diagram={diagram}
                masterDiagram={diagrams.get(diagram.master)}
                onRender={doOnRender}
                rendererService={rendererService}
                selectedItems={[]}
                selectedItemsWithLocked={[]}
                viewBox={bounds}
                viewSize={size}
                zoom={1}
                zoomedSize={zoomedSize}
            />
        </>
    );
};