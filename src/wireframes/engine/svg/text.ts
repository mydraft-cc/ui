/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { sizeInPx } from '@app/core';
import { EngineText, EngineTextPlotArgs } from './../interface';
import { SvgObject } from './object';
import { linkToSvg, SvgHelper } from './utils';

export class SvgText extends SvgObject implements EngineText {
    private readonly container: svg.Container;
    private readonly background: svg.Rect;
    private readonly textElement: svg.ForeignObject;
    private readonly textInner: HTMLDivElement;

    protected get root() {
        return this.container;
    }

    constructor(
        layer: svg.Container,
    ) {
        super();

        this.container = layer.group();
        this.background = this.container.rect();
        this.textElement = SvgHelper.createText('nowrap', undefined, undefined, 'center', 'middle').addTo(this.container);
        this.textInner = this.textElement.node.children[0] as HTMLDivElement;

        linkToSvg(this, this.container);
    }

    public color(value: string) {
        this.textInner.style.color = value;
    }

    public fill(value: string) {
        this.background.fill(value);
    }

    public fontSize(value: number) {
        this.textInner.style.fontSize = sizeInPx(value);
    }

    public fontFamily(value: string) {
        this.textInner.style.fontFamily = value;
    }        

    public text(value: string) {
        this.textInner.textContent = value;
    }

    public plot(args: EngineTextPlotArgs): void {
        const { w, h, padding } = args;

        SvgHelper.transformBy(this.container, args);

        SvgHelper.transformBy(this.textElement, {
            x: padding,
            y: padding,
            w: w - 2 * padding,
            h: h - 2 * padding,
        });

        SvgHelper.transformBy(this.background, { w, h });
    }
}