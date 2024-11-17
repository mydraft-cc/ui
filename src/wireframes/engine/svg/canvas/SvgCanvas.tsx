/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import * as React from 'react';
import { CanvasProps } from '../../canvas';
import { SvgEngine } from './../engine';

export const SvgCanvasView = (props: CanvasProps<SvgEngine>) => {
    const {
        className,
        onInit,
        style,
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

        if (viewBox) {
            engine.doc.viewbox(viewBox.minX, viewBox.minY, viewBox.maxX, viewBox.maxY);
        } else {
            engine.doc.viewbox(null!);
        }

    }, [engine, viewBox]);

    return (
        <div style={style} className={className} ref={doInit} />
    );
};
