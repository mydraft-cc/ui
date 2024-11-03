/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { EngineRect } from '../interface';
import { SvgObject } from './object';
import { linkToSvg, SVGHelper } from './utils';

export class SvgRect extends SvgObject implements EngineRect {
    private readonly shape: svg.Rect;

    protected get root() {
        return this.shape;
    }

    constructor(container: svg.Container) {
        super();
        
        this.shape = container.rect();

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

    public plot(x: number, y: number, w: number, h: number, rotation?: number, rx?: number, ry?: number): void {
        SVGHelper.transformBy(this.shape, {
            x,
            y,
            w,
            h,
            rotation,
            rx,
            ry,
        });
    }
}