/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { EngineRect, EngineRectOrEllipsePlotArgs } from './../interface';
import { SvgObject } from './object';
import { linkToSvg, SvgHelper } from './utils';

export class SvgRectOrEllipse extends SvgObject implements EngineRect {
    protected get root() {
        return this.shape;
    }

    constructor(
        private readonly shape: svg.Shape,
    ) {
        super();
        linkToSvg(this, this.shape);
    }

    public strokeWidth(value: number): void {
        this.shape.stroke({ width: value });
    }

    public strokeColor(value: string): void {
        this.shape.stroke({ color: value });
    }

    public fill(value: string): void {
        this.shape.fill(value);
    }

    public plot(args: EngineRectOrEllipsePlotArgs): void {
        SvgHelper.transformBy(this.shape, args, false, true);
    }
}