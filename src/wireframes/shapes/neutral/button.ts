/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: CommonTheme.CONTROL_BACKGROUND_COLOR,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: CommonTheme.CONTROL_TEXT_COLOR,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'center',
    [DefaultAppearance.TEXT]: 'Button',
};

export class Button implements ShapePlugin {
    public identifier(): string {
        return 'Button';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 100, y: 30 };
    }

    public render(ctx: RenderContext) {
        // Get current theme state
        const isDark = ctx.designThemeMode === 'dark';
        
        // Get theme-aware colors
        const controlBg = isDark ? 0x333333 : CommonTheme.CONTROL_BACKGROUND_COLOR;
        const controlBorder = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        const textColor = isDark ? 0xe0e0e0 : CommonTheme.CONTROL_TEXT_COLOR;
        const borderRadius = CommonTheme.CONTROL_BORDER_RADIUS;
        
        this.createBorder(ctx, controlBg, controlBorder, borderRadius);
        this.createText(ctx, textColor);
    }

    private createBorder(ctx: RenderContext, controlBg: number, controlBorder: number, borderRadius: number) {
        const appearance = ctx.shape;
        
        ctx.renderer2.rectangle(ctx.shape, borderRadius, ctx.rect, p => {
            // Use theme-aware colors if the shape has default colors
            if (appearance.getAppearance(DefaultAppearance.BACKGROUND_COLOR) === CommonTheme.CONTROL_BACKGROUND_COLOR) {
                p.setBackgroundColor(controlBg);
            } else {
                p.setBackgroundColor(ctx.shape);
            }
            
            if (appearance.getAppearance(DefaultAppearance.STROKE_COLOR) === CommonTheme.CONTROL_BORDER_COLOR) {
                p.setStrokeColor(controlBorder);
            } else {
                p.setStrokeColor(ctx.shape);
            }
        });
    }

    private createText(ctx: RenderContext, textColor: number) {
        const appearance = ctx.shape;
        
        ctx.renderer2.text(ctx.shape, ctx.rect.deflate(14, 4), p => {
            // Use theme-aware colors if the shape has default colors
            if (appearance.getAppearance(DefaultAppearance.FOREGROUND_COLOR) === CommonTheme.CONTROL_TEXT_COLOR) {
                p.setForegroundColor(textColor);
            } else {
                p.setForegroundColor(ctx.shape);
            }
        });
    }
}
