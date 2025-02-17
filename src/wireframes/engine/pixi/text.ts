/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Container, Graphics, Text } from 'pixi.js';
import { EngineText, EngineTextPlotArgs } from './../interface';
import { PixiObject } from './object';
import { linkToPixi, PixiHelper } from './utils';

type Values = {
    color: string;
    fill: string;
    fontFamily: string;
    fontSize: number;
    text: string;
    plot: EngineTextPlotArgs;
};

const DEFAULT_ATTRS: Values = {
    color: 'none',
    fill: 'none',
    fontFamily: 'Arial',
    fontSize: 16,
    text: '',
    plot: { x: 0, y: 0, w: 0, h: 0, padding: 0 },
};

export class PixiText extends PixiObject implements EngineText {
    private readonly container = new Container();
    private readonly textBackground = new Graphics();
    private readonly textElement = new Text({ resolution: 6, anchor: 0.5 });
    private readonly attrs = { ...DEFAULT_ATTRS };
    private invalid = true;

    protected get root() {
        return this.container;
    }

    constructor(layer: Container) {
        super();
        linkToPixi(this, this.container);
        
        this.container.eventMode = 'static';
        layer.addChild(this.container);
        this.container.addChild(this.textBackground);
        this.container.addChild(this.textElement);        
    }

    public color(value: string): void {
        this.updateKey('color', PixiHelper.toColor(value));
    }

    public fill(value: string): void {
        this.updateKey('fill', PixiHelper.toColor(value));
    }

    public fontSize(value: number): void {
        this.updateKey('fontSize', value);
    }

    public fontFamily(value: string): void {
        this.updateKey('fontFamily', value);
    }

    public text(value: string): void {
        this.updateKey('text', value);
    }

    public plot(args: EngineTextPlotArgs): void {
        this.updateKey('plot', args);
    }

    public invalidate() {
        if (!this.invalid) {
            return;
        }

        const {
            container,
            textBackground,
            textElement,
            attrs,
        } = this;
        const { color, fill, fontFamily, fontSize, plot, text } = attrs;

        textBackground.clear();
        textBackground.rect(0, 0, plot.w, plot.h).fill(fill);

        textElement.x = 0.5 * plot.w;
        textElement.y = 0.5 * plot.h;
        
        textElement.text = text;
        textElement.style = {
            align: 'center',
            fill: color,
            fontFamily: fontFamily,
            fontSize: fontSize,
            lineHeight: fontSize * 1.7,
        };

        container.x = attrs.plot.x;
        container.y = attrs.plot.y;
    }

    private updateKey<K extends keyof Values>(key: K, value: Values[K]) {
        if (this.attrs[key] !== value) {
            this.attrs[key] = value;
            this.invalid = true;
        }
    }
}