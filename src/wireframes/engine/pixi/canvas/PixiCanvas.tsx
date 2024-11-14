/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Application } from 'pixi.js';
import * as React from 'react';
import { Vec2, ViewBox } from '@app/core';
import { PixiEngine } from './../engine';

export interface PixiCanvasProps {
    // The optional viewbox.
    viewBox: ViewBox;
    
    // The size.
    size?: Vec2;

    // The class name.
    className?: string;

    // The CSS properties.
    style?: React.CSSProperties;

    // The callback when the canvas has been initialized.
    onInit: (engine: PixiEngine) => any;
}

export const PixiCanvasView = (props: PixiCanvasProps) => {
    const {
        className,
        onInit,
        style,
    } = props;

    const [engine, setEngine] = React.useState<PixiEngine>();

    const doInit = React.useCallback((ref: HTMLDivElement) => {
        if (!ref) {
            return;
        }

        for (const child of ref.childNodes) {
            child.remove();
        }

        const application = new Application();

        async function setup() {
            await application.init({ 
                antialias: true,
                autoDensity: true,
                background: 'white',
                resolution: window.devicePixelRatio,
                eventFeatures: {
                    move: true,
                },
            });

            setEngine(new PixiEngine(application));

            ref.appendChild(application.canvas);
        }

        setup();

        return () => {
            application.destroy();
            application.canvas.remove();
        };
    }, []);

    React.useEffect(() => {
        if (engine && onInit) {
            onInit(engine);
        }
    }, [engine, onInit]);

    return (
        <div style={style} className={className} ref={doInit} />
    );
};
