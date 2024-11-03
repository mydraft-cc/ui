/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import * as React from 'react';
import { ViewBox } from '@app/core';
import { Engine } from '../../interface';
import { SvgEngine } from '../engine';

export interface SvgCanvasProps {
    // The optional viewbox.
    viewBox: ViewBox;

    // The class name.
    className?: string;

    // The callback when the canvas has been initialized.
    onInit: (engine: Engine) => any;
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
        engine?.viewBox(viewBox.minX, viewBox.minY, viewBox.maxX, viewBox.maxY);
    }, [engine, viewBox.minX, viewBox.minY, viewBox.maxX, viewBox.maxY]);

    return (
        <div className={className} ref={doInit} />
    );
};
