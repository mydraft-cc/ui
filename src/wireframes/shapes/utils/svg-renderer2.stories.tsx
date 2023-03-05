/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ComponentMeta } from '@storybook/react';
import * as svg from '@svgdotjs/svg.js';
import * as React from 'react';
import { Color, Rect2, SVGHelper } from '@app/core';
import { SVGRenderer2 } from './svg-renderer2';

const RendererHelper = ({ render }: { render: (renderer: SVGRenderer2, width: number, color: string) => void }) => {
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

        document.viewbox(0, 0, itemCount * itemHeight, 100);
        document.clear();
        
        SVGHelper.setSize(document, itemCount * itemHeight, 100);

        const renderer2 = new SVGRenderer2();

        for (let i = 0; i < itemCount; i++) {
            const group = document.group();

            const color = Color.fromHsv((360 / itemCount) * i, 1, 0.75);

            SVGHelper.setSize(group, itemHeight, 100);
            SVGHelper.setPosition(group, 0.5, (i * itemHeight) + 0.5);

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
} as ComponentMeta<typeof RendererHelper>;

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