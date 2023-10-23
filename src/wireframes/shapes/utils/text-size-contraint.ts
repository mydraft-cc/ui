/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { SourceObject, ValueResolver } from 'yjs-redux';
import { Vec2 } from '@app/core/utils';
import { Constraint, Shape } from '@app/wireframes/interface';
import { DiagramItem } from '@app/wireframes/model';
import { SVGRenderer2 } from './svg-renderer2';

export class TextSizeConstraintResolver implements ValueResolver<TextSizeConstraint> {
    constructor(
        private readonly renderer: SVGRenderer2,
    ) {
    }

    public fromYjs(source: SourceObject): TextSizeConstraint {
        return new TextSizeConstraint(this.renderer, source.paddingX as number, source.paddingY as number, source.lineHeight as number, source.resizeWidth as boolean, source.minWidth as number);
    }
    
    public fromValue(source: TextSizeConstraint): SourceObject {
        return { paddingX: source.paddingX, paddingY: source.paddingY, lineHeight: source.lineHeight, resizeWidth: source.resizeWidth, minWidth: source.minWidth };
    }
}

export class TextSizeConstraint implements Constraint {
    public static readonly TYPE_NAME = 'TextHeightConstraint';

    public readonly __typeName = TextSizeConstraint.TYPE_NAME;

    constructor(
        public readonly renderer: SVGRenderer2,
        public readonly paddingX = 0,
        public readonly paddingY = 0,
        public readonly lineHeight = 1.2,
        public readonly resizeWidth = false,
        public readonly minWidth = 0,
    ) {
    }

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
