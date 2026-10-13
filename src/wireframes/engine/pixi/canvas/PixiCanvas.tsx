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
    const [application, setApplication] = React.useState<Application>();
    const canvasContainerRef = React.useRef<HTMLDivElement>(null);

    const pixiEngine = React.useMemo(() => {
        if (!application?.stage) {
            return null;
        }

        return new PixiEngine(application);
    }, [application]);

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

        async function setup(application: Application, containerElement: HTMLDivElement) {
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

            setApplication(application);
            containerElement.appendChild(application!.canvas);
        }

        // Call setup only if ref is valid
        setup(application, ref).catch(console.error);

        return () => {
            if (application && application.stage) {
                application.destroy(true, true);
            }
            setApplication(undefined);
        };
    }, [background]);

    React.useEffect(() => {
        if (!pixiEngine || !onInit) {
            return;
        }
        
        onInit(pixiEngine);
    }, [pixiEngine, onInit]);

    React.useEffect(() => {
        if (!pixiEngine) {
            return;
        }
        
        pixiEngine.application.renderer.background.color = background;
    }, [background, pixiEngine]);

    React.useEffect(() => {
        if (!pixiEngine) {
            return;
        }

        const root = pixiEngine.application.stage;
        if (viewBox) {
            root.scale = viewBox.zoom;
            root.x = -viewBox.minX * viewBox.zoom;
            root.y = -viewBox.minY * viewBox.zoom;
        } else {
            root.scale = 1;
            root.x = 0;
            root.y = 0;
        }

        pixiEngine?.adjustToZoom(viewBox?.zoom || 1);
    }, [pixiEngine, viewBox]);

    return (
        <div style={style} className={className} ref={canvasContainerRef} />
    );
};

export const PixiCanvasView = PixiCanvasViewComponent;