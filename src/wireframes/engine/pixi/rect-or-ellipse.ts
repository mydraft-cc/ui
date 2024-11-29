/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Container, Graphics } from 'pixi.js';
import { MathHelper, Types } from '@app/core';
import { EngineRect, EngineRectOrEllipsePlotArgs } from './../interface';
import { PixiObject } from './object';
import { linkToPixi, PixiHelper } from './utils';

type Values = {
    fill: string;
    strokeColor: string;
    strokeWidth: number;
    plot: EngineRectOrEllipsePlotArgs;
};

const DEFAULT_ATTRS: Values = {
    fill: 'none',
    strokeColor: 'none',
    strokeWidth: 0,
    plot: { x: 0, y: 0, w: 0, h: 0 },
};

export class PixiRect extends PixiObject implements EngineRect {
    private readonly graphics = new Graphics();
    private readonly attrs = { ...DEFAULT_ATTRS };
    private invalid = true;

    protected get root() {
        return this.graphics;
    }

    constructor(layer: Container,
        private readonly rectangle: boolean,
    ) {
        super();
        linkToPixi(this, this.graphics);

        this.graphics.eventMode = 'static';
        layer.addChild(this.graphics);
    }

    public fill(value: string) {
        this.updateKey('fill', PixiHelper.toColor(value));
    }

    public strokeColor(value: string) {
        this.updateKey('strokeColor', PixiHelper.toColor(value));
    }
    
    public strokeWidth(value: number) {
        this.updateKey('strokeWidth', value);
    }
    
    public plot(args: EngineRectOrEllipsePlotArgs): void {
        const prevPlot = this.attrs.plot;

        this.attrs.plot = args;
        if (args.w !== prevPlot.w || args.h !== prevPlot.h) {
            this.invalid = true;
            return;
        }

        this.updateTransform(args);
    }

    public invalidate() {
        if (!this.invalid) {
            return;
        }

        const { attrs, graphics } = this;
        const { w, h } = attrs.plot;

        graphics.clear();
        if (this.rectangle) {
            graphics.rect(0, 0, w, h);
        } else {
            const dw = w * 0.5;
            const dh = h * 0.5;

            graphics.ellipse(dw, dh, dw, dh);
        }

        graphics.fill(attrs.fill);

        if (attrs.strokeWidth > 0) {
            graphics.stroke({ width: attrs.strokeWidth, color: attrs.strokeColor });
        }

        this.updateTransform(attrs.plot);
        this.invalid = false;
    }

    private updateTransform(args: EngineRectOrEllipsePlotArgs) {
        const { x, y, rx, ry, w, h, rotation: r } = args;

        const pivotX = Types.isNumber(rx) ? rx - x : 0.5 * w;
        const pivotY = Types.isNumber(ry) ? ry - y : 0.5 * h;
        
        const rotation = Types.isNumber(r) ? MathHelper.toRad(r) : 0;

        this.root.updateTransform({
            x: x + pivotX,
            y: y + pivotY,
            rotation,
            pivotX,
            pivotY,
        });
    }

    private updateKey<K extends keyof Values>(key: K, value: Values[K]) {
        if (this.attrs[key] !== value) {
            this.attrs[key] = value;
            this.invalid = true;
        }
    }
}