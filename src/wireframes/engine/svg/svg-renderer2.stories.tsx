/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Meta } from '@storybook/react';
import * as svg from '@svgdotjs/svg.js';
import * as React from 'react';
import { Color, Rect2 } from '@app/core';
import { SvgRenderer } from './renderer';
import { SvgHelper } from './utils';

interface RendererHelperProps {
    // The render function.
    onRender: (renderer: SvgRenderer, width: number, color: string) => void;

    // The number of iterations.
    iterations?: number;
}

const RendererHelper = ({ iterations, onRender: render }: RendererHelperProps) => {
    const [document, setDocument] = React.useState<svg.Svg>();
    const innerRef = React.useRef<SVGSVGElement>(null);

    React.useEffect(() => {
        if (!innerRef.current) {
            return;
        }

        setDocument(svg.SVG(innerRef.current!).css({ overflow: 'visible' }));
    }, []);

    React.useEffect(() => {
        if (!document) {
            return;
        }

        const itemCount = iterations || 10;
        const itemHeight = 50;

        document.viewbox(0, 0, 100, itemCount * itemHeight);
        document.clear();
        
        SvgHelper.setSize(document, 100, itemCount * itemHeight);

        const renderer2 = new SvgRenderer();

        for (let i = 0; i < itemCount; i++) {
            const group = document.group();

            const color = Color.fromHsv((360 / itemCount) * i, 1, 0.75);

            SvgHelper.setSize(group, 95, itemHeight);
            SvgHelper.setPosition(group, 0.5, (i * itemHeight) + 0.5);

            renderer2.setContainer(group);
            render(renderer2, i, color.toString());
        }
    }, [document, iterations, render]);

    return (
        <div style={{ lineHeight: 0 }}>
            <svg ref={innerRef} />
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

export const Text = () => {
    return (
        <RendererHelper
            iterations={1}
            onRender={(renderer, color) =>
                renderer.group(i => {
                    i.rectangle(1, 0, new Rect2(0, 0, 100, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.text({ text: 'Hello World' }, new Rect2(0, 0, 100, 60), p => p
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
                    i.rectangle(1, 0, new Rect2(0, 0, 110, 60), p => p
                        .setStrokeColor('black'),
                    );
                    i.textMultiline({ text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.' }, new Rect2(0, 0, 102, 60), p => p
                        .setBackgroundColor('#aaa')
                        .setStrokeColor(color),
                    );
                })
            }
        />
    );
};