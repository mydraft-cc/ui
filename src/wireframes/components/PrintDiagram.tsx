/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { Color, ImmutableMap, Rect2, useEventCallback, Vec2 } from '@app/core';
import { Diagram, DiagramItem, DiagramItemSet } from '@app/wireframes/model';
import { Editor } from '@app/wireframes/renderer/Editor';

export interface PrintDiagramProps {
    // The diagram.
    diagram: Diagram;

    // All diagrams.
    diagrams: ImmutableMap<Diagram>;

    // The diagram size.
    size: Vec2;

    // The color.
    color: Color;

    // True if the bounds should be used as size.
    useBounds?: boolean;

    // True when rendered.
    onRender?: (diagram: Diagram) => void;
    
    // A function that is invoked when the user clicked a link.
    onNavigate?: (item: DiagramItem, link: string) => void;
}

export const PrintDiagram = (props: PrintDiagramProps) => {
    const {
        color,
        diagram,
        diagrams,
        onRender,
        onNavigate,
        size,
        useBounds,
    } = props;

    const doOnRender = useEventCallback(() => {
        onRender && onRender(diagram);
    });

    const { bounds, zoomedSize } = React.useMemo(() => {
        let bounds: Rect2;

        if (useBounds) {
            const aabbs = Array.from(diagram.items.values, x => x.bounds(diagram).aabb);

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
                masterDiagram={diagrams.get(diagram.master!)}
                onNavigate={onNavigate}
                onRender={doOnRender}
                selectionSet={DiagramItemSet.EMPTY}
                viewBox={bounds}
                viewSize={size}
                zoom={1}
                zoomedSize={zoomedSize}
                isDefaultView={false}
            />
        </>
    );
};
