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

const RendererHelper = ({ render }: { render: (renderer: SvgRenderer, width: number, color: string) => void }) => {
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

        const itemCount = 10;
        const itemHeight = 50;

        document.viewbox(0, 0, 100, itemCount * itemHeight);
        document.clear();
        
        SvgHelper.setSize(document, 100, itemCount * itemHeight);

        const renderer2 = new SvgRenderer();

        for (let i = 0; i < itemCount; i++) {
            const group = document.group();

            const color = Color.fromHsv((360 / itemCount) * i, 1, 0.75);

            SvgHelper.setSize(group, 100, itemHeight);
            SvgHelper.setPosition(group, 0.5, (i * itemHeight) + 0.5);

            renderer2.setContainer(group);
            render(renderer2, i, color.toString());
        }
    }, [document, render]);

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
            render={(renderer, strokeWidth, color) =>
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
            render={(renderer, strokeWidth, color) =>
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
            render={(renderer, strokeWidth, color) =>
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
            render={(renderer, strokeWidth, color) =>
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
            render={(renderer, strokeWidth, color) =>
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
            render={(renderer, strokeWidth, color) =>
                renderer.ellipse(strokeWidth, new Rect2(0, 0, 100, 60), p => p
                    .setBackgroundColor('#aaa')
                    .setStrokeColor(color),
                )
            }
        />
    );
};