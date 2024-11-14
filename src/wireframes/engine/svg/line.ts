/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { EngineLine, EngineLinePlotArgs } from './../interface';
import { SvgObject } from './object';
import { linkToSvg } from './utils';

export class SvgLine extends SvgObject implements EngineLine {
    protected get root() {
        return this.shape;
    }

    constructor(
        private readonly shape: svg.Line,
    ) {
        super();
        linkToSvg(this, this.shape);
    }

    public color(value: string): void {
        this.shape.stroke(value);
    }

    public plot(args: EngineLinePlotArgs): void {
        const { x1, y1, x2, y2, width } = args;

        this.shape.plot(x1, y1, x2, y2).stroke({ width });
    }

    public label(value?: string): string {
        if (value) {
            this.shape.id(value);
        }
        
        return this.shape.id();
    }
}