/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Application } from 'pixi.js';
import * as React from 'react';
import { SizeMeProps, withSize } from 'react-sizeme';
import { CanvasProps } from './../../canvas';
import { PixiEngine } from './../engine';

const PixiCanvasViewComponent = (props: CanvasProps<PixiEngine> & SizeMeProps) => {
    const {
        className,
        onInit,
        style,
        viewBox,
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
        if (!engine || !onInit) {
            return;
        }
        
        onInit(engine);
    }, [engine, onInit]);

    React.useEffect(() => {
        if (!engine) {
            return;
        }

        const root = engine.application.stage;
        if (viewBox) {
            root.scale = viewBox.zoom;
            root.x = -viewBox.minX * viewBox.zoom;
            root.y = -viewBox.minY * viewBox.zoom;
        } else {
            root.scale = 1;
            root.x = 0;
            root.y = 0;
        }

    }, [engine, viewBox]);

    return (
        <div style={style} className={className} ref={doInit} />
    );
};

export const PixiCanvasView = withSize({ monitorWidth: true, monitorHeight: true })(PixiCanvasViewComponent);