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

    const viewBox = React.useMemo(() => {
        if (useBounds) {
            const aabbs = Array.from(diagram.items.values, x => x.bounds(diagram).aabb);

            const rect = Rect2.fromRects(aabbs).inflate(20);
            return {
                minX: rect.x,
                minY: rect.y,
                maxX: size.x,
                maxY: size.y,
                zoom: 1,
            };
        } else {
            return {
                minX: 0,
                minY: 0,
                maxX: size.x,
                maxY: size.y,
                zoom: 1,
            };
        }
    }, [diagram, size, useBounds]);

    return (
        <>
            <Editor
                color={color}
                diagram={diagram}
                diagrams={diagrams}
                isDefaultView={false}
                onNavigate={onNavigate}
                onRender={doOnRender}
                selectionSet={DiagramItemSet.EMPTY}
                viewBox={viewBox}
                viewSize={size}
            />
        </>
    );
};
