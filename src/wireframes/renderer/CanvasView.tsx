/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rect2, sizeInPx, Vec2 } from '@app/core';
import * as React from 'react';
import * as svg from '@svgdotjs/svg.js';

export interface CanvasViewProps {
    // The zoomed width of the canvas.
    zoomedSize: Vec2;

    // The optional viewbox.
    viewBox?: Rect2;

    // The view size.
    viewSize: Vec2;

    // The zoom value of the canvas.
    zoom: number;

    // The class name.
    className?: string;

    // The callback when the canvas has been initialized.
    onInit: (scope: svg.Svg) => any;
}

export const CanvasView = (props: CanvasViewProps) => {
    const {
        className,
        onInit,
        viewBox,
        viewSize,
        zoom,
        zoomedSize,
    } = props;

    const [document, setDocument] = React.useState<svg.Svg>();

    const ref = React.useRef();

    React.useLayoutEffect(() => {
        const element = ref.current;

        if (element && !document) {
            const newDocument = svg.SVG().addTo(element).css({ position: 'relative', overflow: 'visible' }).attr('tabindex', 0);

            onInit(newDocument);

            setDocument(newDocument);
        }
    }, [document, onInit, setDocument]);

    React.useLayoutEffect(() => {
        if (document) {
            document
                .size(
                    zoomedSize.x,
                    zoomedSize.y)
                .viewbox(
                    viewBox?.x || 0,
                    viewBox?.y || 0,
                    viewBox ? viewBox.w : viewSize.x,
                    viewBox ? viewBox.h : viewSize.y);
        }
    }, [viewSize, viewBox, zoom, zoomedSize, document]);

    const w = sizeInPx(zoomedSize.x);
    const h = sizeInPx(zoomedSize.x);

    return (
        <div className={className} style={{ width: w, height: h }} ref={ref} />
    );
};
