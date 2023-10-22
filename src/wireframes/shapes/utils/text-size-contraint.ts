/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Vec2 } from '@app/core/utils';
import { Constraint, Shape } from '@app/wireframes/interface';
import { DiagramItem } from '@app/wireframes/model';
import { SVGRenderer2 } from './svg-renderer2';

export class TextSizeConstraint implements Constraint {
    constructor(
        private readonly renderer: SVGRenderer2,
        private readonly paddingX = 0,
        private readonly paddingY = 0,
        private readonly lineHeight = 1.2,
        private readonly resizeWidth = false,
        private readonly minWidth = 0,
    ) { }

    public updateSize(shape: Shape, size: Vec2, prev: DiagramItem): Vec2 {
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
            let textWidth = this.renderer.getTextWidth(text, fontSize, fontFamily);

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
