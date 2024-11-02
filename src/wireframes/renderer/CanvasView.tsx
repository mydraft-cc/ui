/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import * as React from 'react';
import { ViewBox } from '@app/core';

export interface CanvasViewProps {
    // The optional viewbox.
    viewBox: ViewBox;

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
    } = props;

    const [document, setDocument] = React.useState<svg.Svg>();

    const doInit = React.useCallback((ref: HTMLDivElement) => {
        if (!ref) {
            return;
        }

        const doc = svg.SVG().addTo(ref).css({ position: 'relative', overflow: 'visible' }).attr('tabindex', 0);

        setDocument(doc);
    }, []);

    React.useEffect(() => {
        if (document && onInit) {
            onInit(document);
        }
    }, [document, onInit]);

    React.useEffect(() => {
        document?.viewbox(viewBox.minX, viewBox.minY, viewBox.maxX, viewBox.maxY);
    }, [document, viewBox.minX, viewBox.minY, viewBox.maxX, viewBox.maxY]);

    return (
        <div className={className} ref={doInit} />
    );
};
