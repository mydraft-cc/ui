/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, Rect2, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';
import { SHAPE_TEXT_COLOR, getCurrentTheme } from './ThemeShapeUtils';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: CommonTheme.CONTROL_BACKGROUND_COLOR,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: CommonTheme.CONTROL_TEXT_COLOR,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'left',
    [DefaultAppearance.TEXT]: 'Dropdown',
};

export class Dropdown implements ShapePlugin {
    public identifier(): string {
        return 'Dropdown';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 120, y: 30 };
    }

    public render(ctx: RenderContext) {
        const clickArea = Math.min(40, Math.min(0.8 * ctx.rect.width, ctx.rect.height));

        this.createBorder(ctx);
        this.createText(ctx, clickArea);
        this.createClickTriangle(ctx, clickArea);
    }

    private createClickTriangle(ctx: RenderContext, clickSize: number) {
        const appearance = ctx.shape;
        const isDark = getCurrentTheme() === 'dark';
        const controlBorder = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        const y = ctx.rect.height * 0.5;
        const x = ctx.rect.right - 0.5 * clickSize;
        const w = clickSize * 0.3;
        const h = clickSize * 0.2;

        const path = `M${x - 0.5 * w},${y - 0.4 * h} L${x},${y + 0.6 * h},L${x + 0.5 * w},${y - 0.4 * h} z`;

        ctx.renderer2.path(0, path, p => {
            if (appearance.getAppearance(DefaultAppearance.STROKE_COLOR) === CommonTheme.CONTROL_BORDER_COLOR) {
                p.setBackgroundColor(controlBorder);
            } else {
                p.setBackgroundColor(ctx.shape.strokeColor);
            }
        });
    }

    private createBorder(ctx: RenderContext) {
        const appearance = ctx.shape;
        const isDark = getCurrentTheme() === 'dark';
        const controlBg = isDark ? 0x333333 : CommonTheme.CONTROL_BACKGROUND_COLOR;
        const controlBorder = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        
        ctx.renderer2.rectangle(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, ctx.rect, p => {
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

    private createText(ctx: RenderContext, clickSize: number) {
        const appearance = ctx.shape;
        const isDark = getCurrentTheme() === 'dark';
        const textColor = isDark ? SHAPE_TEXT_COLOR.DARK : CommonTheme.CONTROL_TEXT_COLOR;
        const textRect =
            new Rect2(14, 4,
                Math.max(0, ctx.rect.width - clickSize - 6),
                Math.max(0, ctx.rect.height - 8));

        ctx.renderer2.text(ctx.shape, textRect, p => {
            if (appearance.getAppearance(DefaultAppearance.FOREGROUND_COLOR) === CommonTheme.CONTROL_TEXT_COLOR) {
                p.setForegroundColor(textColor);
            } else {
                p.setForegroundColor(ctx.shape);
            }
        });
    }
}
