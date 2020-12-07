/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rect2, Vec2 } from '@app/core';
import { Diagram, RendererService } from '@app/wireframes/model';
import { Editor } from '@app/wireframes/renderer/Editor';
import * as React from 'react';

export interface PrintDiagramProps {
    // The diagram.
    diagram: Diagram;

    // The diagram size.
    size: Vec2;

    // True when rendered.
    onRender?: (diagram: Diagram) => void;

    // The renderer.
    rendererService: RendererService;
}

export const PrintDiagram = (props: PrintDiagramProps) => {
    const {
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

    const bounds = React.useMemo(() => {
        return Rect2.fromRects(diagram.items.values.map(x => x.bounds(diagram).aabb)).inflate(20);
    }, [diagram]);

    return (
        <>
            <Editor
                diagram={diagram}
                onRender={doOnRender}
                rendererService={rendererService}
                selectedItems={[]}
                selectedItemsWithLocked={[]}
                viewBox={bounds}
                viewSize={size}
                zoom={1}
                zoomedSize={new Vec2(bounds.w, bounds.h)}
            />
        </>
    );
};
