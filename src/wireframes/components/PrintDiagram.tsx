/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Color, Rect2, Vec2 } from '@app/core';
import { Diagram, RendererService } from '@app/wireframes/model';
import { Editor } from '@app/wireframes/renderer/Editor';
import * as React from 'react';

export interface PrintDiagramProps {
    // The diagram.
    diagram: Diagram;

    // The diagram size.
    size: Vec2;

    // The color.
    color: Color;

    // True when rendered.
    onRender?: (diagram: Diagram) => void;

    // The renderer.
    rendererService: RendererService;
}

export const PrintDiagram = (props: PrintDiagramProps) => {
    const {
        color,
        diagram,
        rendererService,
        onRender,
        size,
    } = props;

    const doOnRender = React.useCallback(() => {
        if (onRender) {
            onRender(diagram);
        }
    }, [diagram, onRender]);

    const { bounds, zoomedSize } = React.useMemo(() => {
        const bounds = Rect2.fromRects(diagram.items.values.map(x => x.bounds(diagram).aabb)).inflate(20);

        return { bounds, zoomedSize: new Vec2(bounds.w, bounds.h) };
    }, [diagram]);

    return (
        <>
            <Editor
                color={color}
                diagram={diagram}
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
