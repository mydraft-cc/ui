/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConfigurableFactory, DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';
import { SHAPE_BACKGROUND_COLOR, SHAPE_TEXT_COLOR, getCurrentTheme } from './ThemeShapeUtils';

const BORDER_RADIUS = 'BORDER_RADIUS';
const PADDING_HORIZONTAL = 'PADDING_HORIZONTAL2';
const PADDING_VERTICAL = 'PADDING_VERTICAL2';

const DEFAULT_APPEARANCE = {
    [BORDER_RADIUS]: 0,
    // Use light theme by default, dark will be applied dynamically
    [DefaultAppearance.BACKGROUND_COLOR]: SHAPE_BACKGROUND_COLOR.LIGHT,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: SHAPE_TEXT_COLOR.LIGHT,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'center',
    [DefaultAppearance.TEXT]: 'Rectangle',
    [PADDING_HORIZONTAL]: 10,
    [PADDING_VERTICAL]: 10,
};

export class Rectangle implements ShapePlugin {
    public identifier(): string {
        return 'Rectangle';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 100, y: 100 };
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.slider(BORDER_RADIUS, 'Border Radius', 0, 40),
            factory.number(PADDING_HORIZONTAL, 'Padding Horizontal', 0, 40),
            factory.number(PADDING_VERTICAL, 'Padding Vertical', 0, 40),
        ];
    }

    public render(ctx: RenderContext) {
        const appearance = ctx.shape;
        const radius = appearance.getAppearance(BORDER_RADIUS);
        const padH = appearance.getAppearance(PADDING_HORIZONTAL);
        const padV = appearance.getAppearance(PADDING_VERTICAL);
        
        // Get current theme state
        const isDark = getCurrentTheme() === 'dark';
        
        // Get theme-aware colors for background and text
        const bgColor = isDark ? SHAPE_BACKGROUND_COLOR.DARK : SHAPE_BACKGROUND_COLOR.LIGHT;
        const textColor = isDark ? SHAPE_TEXT_COLOR.DARK : SHAPE_TEXT_COLOR.LIGHT;

        ctx.renderer2.rectangle(ctx.shape, radius, ctx.rect, p => {
            // Use the theme-appropriate color if matching default, otherwise use the shape's set color
            if (appearance.getAppearance(DefaultAppearance.BACKGROUND_COLOR) === SHAPE_BACKGROUND_COLOR.LIGHT) {
                p.setBackgroundColor(bgColor);
            } else {
                p.setBackgroundColor(ctx.shape);
            }
            p.setStrokeColor(ctx.shape);
        });

        if (!appearance.textDisabled) {
            ctx.renderer2.text(ctx.shape, ctx.rect.deflate(padH, padV), p => {
                // Use the theme-appropriate color if matching default, otherwise use the shape's set color
                if (appearance.getAppearance(DefaultAppearance.FOREGROUND_COLOR) === SHAPE_TEXT_COLOR.LIGHT) {
                    p.setForegroundColor(textColor);
                } else {
                    p.setForegroundColor(ctx.shape);
                }
            });
        }
    }
}
