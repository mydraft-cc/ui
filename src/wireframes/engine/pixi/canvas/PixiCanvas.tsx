/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Application } from 'pixi.js';
import * as React from 'react';
import { CanvasProps } from './../../canvas';
import { PixiEngine } from './../engine';

const PixiCanvasViewComponent = (props: CanvasProps<PixiEngine> & { background?: string }) => {
    const {
        className,
        onInit,
        style,
        viewBox,
    } = props;

    const background = props.background || 'white';
    const [engine, setEngine] = React.useState<PixiEngine>();
    const canvasContainerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const ref = canvasContainerRef.current;
        if (!ref) {
            return;
        }

        // Clear previous PIXI canvas if any (important for HMR or re-renders)
        while (ref.firstChild) {
            ref.removeChild(ref.firstChild);
        }
        
        // Define application variable here to be accessible in cleanup
        let application: Application | null = new Application();

        async function setup(containerElement: HTMLDivElement) {
            // Initialize application (application should not be null here)
            await application!.init({ 
                antialias: true,
                autoDensity: true,
                background,
                eventFeatures: {
                    move: true,
                },
                resizeTo: containerElement,
                resolution: window.devicePixelRatio,
            });

            setEngine(new PixiEngine(application!));

            containerElement.appendChild(application!.canvas);
        }

        // Call setup only if ref is valid
        setup(ref).catch(console.error);

        return () => {
            if (application && application.stage) {
                application.destroy(true, true);
            }
            application = null;
            setEngine(undefined);
        };
    }, [background]);

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
        
        engine.application.renderer.background.color = background;
    }, [background, engine]);

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
        <div style={style} className={className} ref={canvasContainerRef} />
    );
};

export const PixiCanvasView = PixiCanvasViewComponent;