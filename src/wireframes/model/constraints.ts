/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper, TextMeasurer, Vec2 } from '@app/core/utils';
import { Shape } from '@app/wireframes/interface';
import { DiagramItem } from './diagram-item';

export interface Constraint {
    updateSize(shape: Shape, size: Vec2, prev?: Shape): Vec2;

    calculateSizeX(): boolean;

    calculateSizeY(): boolean;
}

export class SizeConstraint implements Constraint {
    constructor(
        private readonly width: number | undefined,
        private readonly height: number | undefined,
    ) {
        Object.freeze(this);
    }

    public updateSize(_: Shape, size: Vec2): Vec2 {
        let w = size.x;
        let h = size.y;

        if (this.width) {
            w = this.width;
        }

        if (this.height) {
            h = this.height;
        }

        return new Vec2(w, h);
    }

    public calculateSizeX(): boolean {
        return !!this.width;
    }

    public calculateSizeY(): boolean {
        return !!this.height;
    }
}

export class MinSizeConstraint implements Constraint {
    constructor() {
        Object.freeze(this);
    }

    public updateSize(_: Shape, size: Vec2): Vec2 {
        const minSize = Math.min(size.x, size.y);

        return new Vec2(minSize, minSize);
    }

    public calculateSizeX(): boolean {
        return false;
    }

    public calculateSizeY(): boolean {
        return false;
    }
}

export class TextHeightConstraint implements Constraint {
    constructor(
        private readonly padding: number,
    ) {
        Object.freeze(this);
    }

    public updateSize(shape: Shape, size: Vec2): Vec2 {
        const fontSize = shape.fontSize;

        return new Vec2(size.x, MathHelper.roundToMultipleOfTwo(fontSize * 1.2 + this.padding * 2));
    }

    public calculateSizeX(): boolean {
        return false;
    }

    public calculateSizeY(): boolean {
        return true;
    }
}

export class TextSizeConstraint implements Constraint {
    constructor(
        private readonly measurer: TextMeasurer,
        private readonly paddingX = 0,
        private readonly paddingY = 0,
        private readonly lineHeight = 1.2,
        private readonly resizeWidth = false,
        private readonly minWidth = 0,
    ) { }

    public updateSize(shape: Shape, size: Vec2, prev?: DiagramItem): Vec2 {
        const fontSize = shape.fontSize;
        const fontFamily = shape.fontFamily;

        let finalWidth = size.x;

        const text = shape.text;

        let prevText = '';
        let prevFontSize = 0;
        let prevFontFamily = '';

        if (prev) {
            prevText = prev.text;

            prevFontSize = prev.fontSize;
            prevFontFamily = prev.fontFamily;
        }

        if (prevText !== text || prevFontSize !== fontSize || prevFontFamily !== fontFamily) {
            let textWidth = this.measurer.getTextWidth(text, fontSize, fontFamily);

            if (textWidth) {
                textWidth += 2 * this.paddingX;

                if (finalWidth < textWidth || !this.resizeWidth) {
                    finalWidth = textWidth;
                }

                finalWidth = Math.max(this.minWidth, finalWidth);
            }
        }

        return new Vec2(finalWidth, fontSize * this.lineHeight + this.paddingY * 2).roundToMultipleOfTwo();
    }

    public calculateSizeX(): boolean {
        return !this.resizeWidth;
    }

    public calculateSizeY(): boolean {
        return true;
    }
}
