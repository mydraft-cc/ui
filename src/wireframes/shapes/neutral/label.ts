/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/
import { ConstraintFactory, DefaultAppearance, RenderContext, ShapePlugin, ShapeSource, Shape } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';
import { Rect2, Vec2 } from '@app/core';
import { TextMeasurer } from '@app/core';
import { Color } from '@app/core';
import { SHAPE_TEXT_COLOR } from './ThemeShapeUtils';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: SHAPE_TEXT_COLOR.LIGHT,
    [DefaultAppearance.TEXT]: 'Label',
};

export class Label implements ShapePlugin {
    public identifier(): string {
        return 'Label';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 80, y: 30 };
    }

    public create(source: ShapeSource) {
        if (source.type == 'Text') {
            return {
                renderer: this.identifier(),
                appearance: { 
                    [DefaultAppearance.TEXT]: source.text,
                },
            };
        }

        return null;
    }

    public constraint() {
        return {
            updateSize: (shape: Shape, size: Vec2) => {
                const fontSize = shape.getAppearance(DefaultAppearance.FONT_SIZE);
                const fontFamily = shape.getAppearance(DefaultAppearance.FONT_FAMILY);
                const width = TextMeasurer.DEFAULT.getTextWidth(shape.text, fontSize, fontFamily);
                return new Vec2(width, size.y);
            },
            calculateSizeX: () => false,
            calculateSizeY: () => true,
        };
    }

    public render(ctx: RenderContext) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        const textColor = isDark ? SHAPE_TEXT_COLOR.DARK : SHAPE_TEXT_COLOR.LIGHT;
        
        ctx.renderer2.text(ctx.shape, ctx.rect, p => {
            if (appearance.getAppearance(DefaultAppearance.FOREGROUND_COLOR) === SHAPE_TEXT_COLOR.LIGHT) {
                p.setForegroundColor(textColor);
            } else {
                p.setForegroundColor(ctx.shape);
            }
        }, true);
    }
}
