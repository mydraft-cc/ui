/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Container, Graphics } from 'pixi.js';
import { EngineLine, EngineLinePlotArgs } from './../interface';
import { PixiObject } from './object';
import { linkToPixi, PixiHelper } from './utils';

type Values = {
    color: string;
    plot: EngineLinePlotArgs;
};

const DEFAULT_ATTRS: Values = {
    color: 'none',
    plot: { x1: 0, y1: 0, x2: 0, y2: 0, width: 0 },
};

export class PixiLine extends PixiObject implements EngineLine {
    private readonly graphics = new Graphics();
    private readonly attrs = { ...DEFAULT_ATTRS };
    private invalid = true;

    protected get root() {
        return this.graphics;
    }

    constructor(layer: Container) {
        super();
        linkToPixi(this, this.graphics);

        layer.addChild(this.graphics);
    }
    
    public color(value: string): void {
        this.updateKey('color', PixiHelper.toColor(value));
    }

    public plot(args: EngineLinePlotArgs): void {
        this.updateKey('plot', args);
    }

    public invalidate() {
        if (!this.invalid) {
            return;
        }

        const { graphics, attrs: values } = this;
        const { x1, y1, x2, y2, width } = values.plot;

        graphics.clear();
        graphics.moveTo(x1, y1).lineTo(x2, y2).stroke({ color: values.color, width });
        this.invalid = false;
    }

    private updateKey<K extends keyof Values>(key: K, value: Values[K]) {
        if (this.attrs[key] !== value) {
            this.attrs[key] = value;
            this.invalid = true;
        }
    }
}