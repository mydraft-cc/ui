/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Meta } from '@storybook/react';
import * as React from 'react';
import { Color, Rect2, Rotation, Vec2 } from '@app/core';
import { RenderContext, ShapeRenderer } from '@app/wireframes/interface';
import { DiagramItem, Transform } from '@app/wireframes/model';
import { PixiCanvasView } from './canvas/PixiCanvas';
import { PixiEngine } from './engine';

class DummyPlugin {
    constructor(
        private readonly renderer: (renderer: ShapeRenderer, width: number, color: string) => void,
        private readonly width: number,
        private readonly color: string,
    ) {
    }

    public render(ctx: RenderContext) {
        this.renderer(ctx.renderer2, this.width, this.color);
    }
}

interface RendererHelperProps {
    // The render function.
    onRender: (renderer: ShapeRenderer, width: number, color: string) => void;

    // The number of iterations.
    iterations?: number;
}

const RendererHelper = ({ iterations, onRender }: RendererHelperProps) => {
    const [engine, setEngine] = React.useState<PixiEngine>();

    React.useEffect(() => {
        if (engine) {
            const layer = engine.layer('default');
            const itemCount = iterations || 10;
            const itemHeight = 50;

            for (let i = 0; i < itemCount; i++) {    
                const color = Color.fromHsv((360 / itemCount) * i, 1, 0.75);

                const item = layer.item(new DummyPlugin(onRender, i, color.toString()) as any);
                item.plot(
                    DiagramItem.createShape({ 
                        renderer: 'none',
                        transform: new Transform(new Vec2(50, i * itemHeight), new Vec2(100, itemHeight), Rotation.ZERO),
                    }));

            }
        }
    }, [engine, iterations, onRender]);

    return (
        <div style={{ lineHeight: 0 }}>
            <PixiCanvasView style={{ height: '500px' }} viewBox={{ minX: 0, minY: 0, maxX: 500, maxY: 500, zoom: 1 }} onInit={setEngine} />
        </div>
    );
};

export default {
    component: RendererHelper,
} as Meta<typeof RendererHelper>;

export const Rect = () => {
    return (
        <RendererHelper
            onRender={(renderer, strokeWidth, color) =>
                renderer.rectangle(strokeWidth, 0, new Rect2(0, 0, 100, 60), p => p
                    .setBackgroundColor('#aaa')
                    .setStrokeColor(color),
                )
            }
        />
    );
};

export const RoundedRectLeft = () => {
    return (
        <RendererHelper
            onRender={(renderer, strokeWidth, color) =>
                renderer.roundedRectangleLeft(strokeWidth, 20, new Rect2(0, 0, 100, 60), p => p
                    .setBackgroundColor('#aaa')
                    .setStrokeColor(color),
                )
            }
        />
    );
};

export const RoundedRectRight = () => {
    return (
        <RendererHelper
            onRender={(renderer, strokeWidth, color) =>
                renderer.roundedRectangleRight(strokeWidth, 20, new Rect2(0, 0, 100, 60), p => p
                    .setBackgroundColor('#aaa')
                    .setStrokeColor(color),
                )
            }
        />
    );
};

export const RoundedRectTop = () => {
    return (
        <RendererHelper
            onRender={(renderer, strokeWidth, color) =>
                renderer.roundedRectangleTop(strokeWidth, 20, new Rect2(0, 0, 100, 60), p => p
                    .setBackgroundColor('#aaa')
                    .setStrokeColor(color),
                )
            }
        />
    );
};

export const RoundedRectBottom = () => {
    return (
        <RendererHelper
            onRender={(renderer, strokeWidth, color) =>
                renderer.roundedRectangleBottom(strokeWidth, 20, new Rect2(0, 0, 100, 60), p => p
                    .setBackgroundColor('#aaa')
                    .setStrokeColor(color),
                )
            }
        />
    );
};

export const Ellipse = () => {
    return (
        <RendererHelper
            onRender={(renderer, strokeWidth, color) =>
                renderer.ellipse(strokeWidth, new Rect2(0, 0, 100, 60), p => p
                    .setBackgroundColor('#aaa')
                    .setStrokeColor(color),
                )
            }
        />
    );
};

export const TextCenter = () => {
    return (
        <RendererHelper
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.text({ text: 'Hello World', alignment: 'center' }, new Rect2(0, 0, 100, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color),
                    );
                })
            }
        />
    );
};

export const TextLeft = () => {
    return (
        <RendererHelper
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.text({ text: 'Hello World', alignment: 'left' }, new Rect2(0, 0, 100, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color),
                    );
                })
            }
        />
    );
};

export const TextRight = () => {
    return (
        <RendererHelper
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.text({ text: 'Hello World', alignment: 'right' }, new Rect2(0, 0, 100, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color),
                    );
                })
            }
        />
    );
};

export const TruncatedText = () => {
    return (
        <RendererHelper
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.text({ text: 'Lorem ipsum dolor sit amet' }, new Rect2(0, 0, 100, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color),
                    );
                })
            }
        />
    );
};

export const MultilineText = () => {
    return (
        <RendererHelper
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.textMultiline({ text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' }, new Rect2(0, 0, 100, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color),
                    );
                })
            }
        />
    );
};