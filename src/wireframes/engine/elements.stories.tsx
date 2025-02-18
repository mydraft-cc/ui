/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Meta } from '@storybook/react';
import { Card, Col, Row } from 'antd';
import * as React from 'react';
import { Canvas, ViewBox } from '@app/core';
import { CanvasProps } from './canvas';
import { Engine, EngineObject, Listener } from './interface';
import { PixiCanvasView } from './pixi/canvas/PixiCanvas';
import { SvgCanvasView } from './svg/canvas/SvgCanvas';

interface EngineProps {
    // The viewbox.
    viewBox?: ViewBox;

    // The render function.
    onRender: (engine: Engine) => void;
}

const EngineCanvas = (props: EngineProps & { canvasView: React.ComponentType<CanvasProps> }) => {
    const [engine, setEngine] = React.useState<Engine>();
    const { onRender } = props;

    React.useEffect(() => {
        if (engine) {
            onRender(engine);
        }
    }, [engine, onRender]);

    return (
        <div style={{ height: '500px', overflow: 'hidden' }}>
            <Canvas padding={0} contentWidth={500} contentHeight={500}
                onRender={viewBox => 
                    <props.canvasView style={{ height: '500px', overflow: 'hidden' }} viewBox={viewBox} onInit={setEngine} />
                } />
        </div>
    );
};

const CompareView = (props: Omit<EngineProps, 'viewBox'>) => {
    return (
        <Row gutter={16}>
            <Col span={12}>
                <Card title='SVG' style={{ overflow: 'hidden' }}>
                    <EngineCanvas canvasView={SvgCanvasView} {...props} />
                </Card>
            </Col>
            <Col span={12}>
                <Card title='PIXI' style={{ overflow: 'hidden' }}>
                    <EngineCanvas canvasView={PixiCanvasView as any} {...props} />
                </Card>
            </Col>
        </Row>
    );
};

const HitTestForCanvas = (props: { canvasView: React.ComponentType<CanvasProps> }) => {
    const [engine, setEngine] = React.useState<Engine>();
    const [relativeX, setRelativeX] = React.useState(0);
    const [relativeY, setRelativeY] = React.useState(0);
    const [hits, setHits] = React.useState<EngineObject[]>();

    React.useEffect(() => {
        if (!engine) {
            return;
        }

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
        rect2.plot({ x: 100, y: 150, w: 300, h: 200 });

        const listener: Listener = {
            onMouseMove: (event) => {
                const hits = layer.hitTest(event.position.x, event.position.y);
                setHits(hits);
                setRelativeX(event.position.x);
                setRelativeY(event.position.y);
            },
        };

        engine.subscribe(listener);

        return () => {
            engine.unsubscribe(listener);
        };
        
    }, [engine]);

    return (
        <div style={{ lineHeight: 1.5 }}>
            Hits: {hits?.length}, X: {relativeX}, Y: {relativeY}

            <div style={{ height: '500px', overflow: 'hidden' }}>
                <Canvas padding={0} contentWidth={500} contentHeight={500}
                    onRender={viewBox => 
                        <props.canvasView viewBox={viewBox} style={{ height: '500px' }} onInit={setEngine} />
                    } />
            </div>
        </div>
    );
};

const CompareHitTests = () => {
    return (
        <Row gutter={16}>
            <Col span={12}>
                <Card title='SVG' style={{ overflow: 'hidden' }}>
                    <HitTestForCanvas canvasView={SvgCanvasView} />
                </Card>
            </Col>
            <Col span={12}>
                <Card title='PIXI' style={{ overflow: 'hidden' }}>
                    <HitTestForCanvas canvasView={PixiCanvasView as any} />
                </Card>
            </Col>
        </Row>
    );
};


export default {
    component: CompareView,
    parameters: {
        backgrounds: {
            default: 'Gray',
        },
    },
} as Meta<typeof CompareView>;

export const Hits = () => {
    return (
        <CompareHitTests />
    );
};

export const Rect = () => {
    return (
        <CompareView
            onRender={(engine) => {
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
        <CompareView
            onRender={(engine) => {
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
        <CompareView
            onRender={(engine) => {
                const layer = engine.layer('layer1');

                const line1 = layer.line();
                line1.color('red');
                line1.plot({ x1: 100, y1: 150, x2: 200, y2: 250, width: 1 });

                const line2 = layer.line();
                line2.color('blue');
                line2.plot({ x1: 140, y1: 150, x2: 240, y2: 250, width: 1 });

                const line3 = layer.line();
                line3.color('green');
                line3.plot({ x1: 180, y1: 150, x2: 280, y2: 250, width: 1 });
            }}
        />
    );
};

export const Text = () => {
    return (
        <CompareView
            onRender={(engine) => {
                const layer = engine.layer('layer1');

                const text1 = layer.text();
                text1.color('white');
                text1.fill('black');
                text1.fontFamily('Arial');
                text1.fontSize(16);
                text1.text('Hello Engine');
                text1.plot({ x: 50, y: 100, w: 200, h: 60, padding: 0 });

                const text2 = layer.text();
                text2.color('white');
                text2.fill('red');
                text2.fontFamily('Arial');
                text2.fontSize(16);
                text2.text('Hello Engine');
                text2.plot({ x: 50, y: 200, w: 200, h: 60, padding: 8 });
            }}
        />
    );
};

export const Pivot = () => {
    return (
        <CompareView
            onRender={(engine) => {
                const layer = engine.layer('layer1');
                const rx = 300;
                const ry = 300;
                const size = 40;

                const renderCircle = (dx: number, dy: number, angle: number, fill: string) => {
                    const hs = 0.5 * size;

                    const circle = layer.ellipse();
                    circle.fill(fill);
                    circle.strokeColor('black');
                    circle.strokeWidth(2);
                    circle.cursor(angle);
                    circle.plot({ x: rx - hs + dx, y: ry - hs + dy, w: size, h: size, rx, ry, rotation: 30 });
                };

                renderCircle(0, 0, 0, 'blue');

                renderCircle(-100, -100, 315, 'orange');
                renderCircle(+100, -100, 45, 'purple');
                renderCircle(+100, +100, 135, 'green');
                renderCircle(-100, +100, 225, 'red');
            }}
        />
    );
};

export const Cursors = () => {
    return (
        <CompareView
            onRender={(engine) => {
                const layer = engine.layer('layer1');

                const move = layer.text();
                move.color('white');
                move.cursor('move');
                move.fill('black');
                move.fontFamily('Arial');
                move.fontSize(16);
                move.text('move');
                move.plot({ x: 50, y: 100, w: 200, h: 60, padding: 20 });

                const resize = layer.text();
                resize.color('white');
                resize.cursor('n-resize');
                resize.fill('red');
                resize.fontFamily('Arial');
                resize.fontSize(16);
                resize.text('resize');
                resize.plot({ x: 50, y: 200, w: 200, h: 60, padding: 20 });
            }}
        />
    );
};