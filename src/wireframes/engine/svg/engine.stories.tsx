/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Meta } from '@storybook/react';
import * as React from 'react';
import { EngineObject, Listener } from './../interface';
import { SvgCanvasView } from './canvas/SvgCanvas';
import { SvgEngine } from './engine';

const RendererHelper = ({ render }: { render: (engine: SvgEngine) => void }) => {
    const [engine, setEngine] = React.useState<SvgEngine>();
    
    React.useEffect(() => {
        if (engine) {
            engine?.doc.size(500, 500);
        }
    }, [engine, engine?.doc]);

    React.useEffect(() => {
        if (engine) {
            engine.doc.clear();
            render(engine);
        }
    }, [engine, render]);

    return (
        <div style={{ lineHeight: 0 }}>
            <SvgCanvasView viewBox={{ minX: 0, minY: 0, maxX: 500, maxY: 500, zoom: 1 }} onInit={setEngine} />
        </div>
    );
};

const HitTest = () => {
    const [engine, setEngine] = React.useState<SvgEngine>();
    const [hits, setHits] = React.useState<EngineObject[]>();
    
    React.useEffect(() => {
        if (engine) {
            engine?.doc.size(500, 500);
        }
    }, [engine, engine?.doc]);

    React.useEffect(() => {
        if (!engine) {
            return;
        }

        engine.doc.clear();
    
        const layer = engine.layer('layer1');

        const rect1 = layer.rect();
        rect1.fill('blue');
        rect1.strokeColor('red');
        rect1.strokeWidth(2);
        rect1.plot({ x: 100, y: 150, w: 300, h: 200, rotation: 45 });

        const rect2 = layer.rect();
        rect2.fill('yellow');
        rect2.strokeColor('green');
        rect2.strokeWidth(2);
        rect2.plot({ x: 600, y: 150, w: 300, h: 200 });

        const listener: Listener = {
            onMouseMove: (event) => {
                const hits = layer.hitTest(event.position.x, event.position.y);
                setHits(hits);
            },
        };

        engine.subscribe(listener);

        return () => {
            engine.unsubscribe(listener);
        };
        
    }, [engine]);

    return (
        <div style={{ lineHeight: 0 }}>
            Hits: {hits?.length}

            <SvgCanvasView viewBox={{ minX: 0, minY: 0, maxX: 500, maxY: 500, zoom: 1 }} onInit={setEngine} />
        </div>
    );
};

export default {
    component: RendererHelper,
} as Meta<typeof RendererHelper>;

export const Hits = () => {
    return (
        <HitTest />
    );
};

export const Rect = () => {
    return (
        <RendererHelper
            render={(engine) => {
                const layer = engine.layer('layer1');

                const rect = layer.rect();
                rect.fill('blue');
                rect.strokeColor('red');
                rect.strokeWidth(2);
                rect.plot({ x: 100, y: 150, w: 300, h: 200 });
            }}
        />
    );
};

export const Ellipse = () => {
    return (
        <RendererHelper
            render={(engine) => {
                const layer = engine.layer('layer1');

                const ellipse = layer.ellipse();
                ellipse.fill('blue');
                ellipse.strokeColor('red');
                ellipse.strokeWidth(2);
                ellipse.plot({ x: 100, y: 150, w: 300, h: 200 });
            }}
        />
    );
};

export const Line1 = () => {
    return (
        <RendererHelper
            render={(engine) => {
                const layer = engine.layer('layer1');

                const line1 = layer.line();
                line1.color('red');
                line1.plot({ x1: 100, y1: 150, x2: 200, y2: 250, width: 1 });

                const line2 = layer.line();
                line2.color('blue');
                line1.plot({ x1: 140, y1: 150, x2: 240, y2: 250, width: 1 });

                const line3 = layer.line();
                line3.color('green');
                line1.plot({ x1: 180, y1: 150, x2: 280, y2: 250, width: 1 });
            }}
        />
    );
};

export const Text = () => {
    return (
        <RendererHelper
            render={(engine) => {
                const layer = engine.layer('layer1');

                const text1 = layer.text();
                text1.color('white');
                text1.fill('black');
                text1.fontFamily('inherit');
                text1.fontSize(16);
                text1.text('Hello SVG');
                text1.plot({ x: 50, y: 100, w: 200, h: 60, padding: 20 });

                const text2 = layer.text();
                text2.color('white');
                text2.fill('red');
                text2.fontFamily('inherit');
                text2.fontSize(16);
                text2.text('Hello SVG');
                text1.plot({ x: 50, y: 200, w: 200, h: 60, padding: 20 });
            }}
        />
    );
};

export const Cursors = () => {
    return (
        <RendererHelper
            render={(engine) => {
                const layer = engine.layer('layer1');

                const move = layer.text();
                move.color('white');
                move.cursor('move');
                move.fill('black');
                move.fontFamily('inherit');
                move.fontSize(16);
                move.text('move');
                move.plot({ x: 50, y: 100, w: 200, h: 60, padding: 20 });

                const resize = layer.text();
                resize.color('white');
                resize.cursor('n-resize');
                resize.fill('red');
                resize.fontFamily('inherit');
                resize.fontSize(16);
                resize.text('resize');
                resize.plot({ x: 50, y: 200, w: 200, h: 60, padding: 20 });
            }}
        />
    );
};