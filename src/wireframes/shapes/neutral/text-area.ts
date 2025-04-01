/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';
import { SHAPE_BACKGROUND_COLOR, SHAPE_TEXT_COLOR } from './ThemeShapeUtils';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: SHAPE_BACKGROUND_COLOR.LIGHT,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: SHAPE_TEXT_COLOR.LIGHT,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'left',
    [DefaultAppearance.TEXT]: 'TextArea',
};

export class TextArea implements ShapePlugin {
    public identifier(): string {
        return 'TextArea';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 160, y: 60 };
    }

    public previewSize(desiredWidth: number) {
        return { x: desiredWidth, y: 60 };
    }

    public render(ctx: RenderContext) {
        this.createBorder(ctx);
        this.createText(ctx);
    }

    private createBorder(ctx: RenderContext) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        const bgColor = isDark ? SHAPE_BACKGROUND_COLOR.DARK : SHAPE_BACKGROUND_COLOR.LIGHT;
        const borderColor = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        
        ctx.renderer2.rectangle(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, ctx.rect, p => {
            // Use theme-aware background color if the shape has default color
            if (appearance.getAppearance(DefaultAppearance.BACKGROUND_COLOR) === SHAPE_BACKGROUND_COLOR.LIGHT) {
                p.setBackgroundColor(bgColor);
            } else {
                p.setBackgroundColor(ctx.shape);
            }
            
            // Use theme-aware border color if the shape has default color
            if (appearance.getAppearance(DefaultAppearance.STROKE_COLOR) === CommonTheme.CONTROL_BORDER_COLOR) {
                p.setStrokeColor(borderColor);
            } else {
                p.setStrokeColor(ctx.shape);
            }
        });
    }

    private createText(ctx: RenderContext) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        const textColor = isDark ? SHAPE_TEXT_COLOR.DARK : SHAPE_TEXT_COLOR.LIGHT;
        
        ctx.renderer2.textMultiline(ctx.shape, ctx.rect.deflate(14, 4), p => {
            // Use theme-aware text color if the shape has default color
            if (appearance.getAppearance(DefaultAppearance.FOREGROUND_COLOR) === SHAPE_TEXT_COLOR.LIGHT) {
                p.setForegroundColor(textColor);
            } else {
                p.setForegroundColor(ctx.shape);
            }
        });
    }
}
