/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import * as React from 'react';
import { Vec2, ViewBox } from '@app/core';
import { SvgEngine } from '../engine';

export interface SvgCanvasProps {
    // The optional viewbox.
    viewBox: ViewBox;
    
    // The size.
    size?: Vec2;

    // The class name.
    className?: string;

    // The callback when the canvas has been initialized.
    onInit: (engine: SvgEngine) => any;
}

export const SvgCanvasView = (props: SvgCanvasProps) => {
    const {
        className,
        onInit,
        viewBox,
    } = props;

    const [engine, setEngine] = React.useState<SvgEngine>();

    const doInit = React.useCallback((ref: HTMLDivElement) => {
        if (!ref) {
            return;
        }

        const doc = svg.SVG().addTo(ref).css({ position: 'relative', overflow: 'visible' }).attr('tabindex', 0);

        setEngine(new SvgEngine(doc));
    }, []);

    React.useEffect(() => {
        if (engine && onInit) {
            onInit(engine);
        }
    }, [engine, onInit]);

    React.useEffect(() => {
        if (!engine) {
            return;
        }

        engine.viewBox(viewBox.minX, viewBox.minY, viewBox.maxX, viewBox.maxY);
    }, [engine, viewBox.minX, viewBox.minY, viewBox.maxX, viewBox.maxY]);

    return (
        <div className={className} ref={doInit} />
    );
};
