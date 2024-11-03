/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { EngineLine } from './../interface';
import { SvgObject } from './object';
import { linkToSvg } from './utils';

export class SvgLine extends SvgObject implements EngineLine {
    private readonly shape: svg.Line;

    protected get root() {
        return this.shape;
    }

    constructor(container: svg.Container) {
        super();

        this.shape = container.line();

        linkToSvg(this, this.shape);
    }

    public color(value: string): void {
        this.shape.fill(value);
    }

    public plot(x1: number, y1: number, x2: number, y2: number, width: number): void {
        this.shape.plot(x1, y1, x2, y2).stroke({ width });
    }

    public label(value?: string): string {
        if (value) {
            this.shape.id(value);
        }
        
        return this.shape.id();
    }
}