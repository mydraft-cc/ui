/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, Rect2, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';
import { SHAPE_BACKGROUND_COLOR, SHAPE_TEXT_COLOR } from './ThemeShapeUtils';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: CommonTheme.CONTROL_BACKGROUND_COLOR,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: CommonTheme.CONTROL_TEXT_COLOR,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'left',
    [DefaultAppearance.TEXT]: '43',
};

export class Numeric implements ShapePlugin {
    public identifier(): string {
        return 'Numeric';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 80, y: 30 };
    }

    public render(ctx: RenderContext) {
        const clickSize = Math.min(40, Math.min(0.8 * ctx.rect.width, ctx.rect.height));

        this.createInputArea(ctx, clickSize);
        this.createText(ctx, clickSize);
        this.createClickArea(ctx, clickSize);
        this.createIncrementer(ctx, clickSize);
        this.createDecrementer(ctx, clickSize);
    }

    private createClickArea(ctx: RenderContext, clickSize: number) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        const controlBg = isDark ? 0x333333 : CommonTheme.CONTROL_BACKGROUND_COLOR;
        const controlBorder = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        const clickAreaRect = new Rect2(ctx.rect.right - clickSize, 0, clickSize, ctx.rect.height);

        ctx.renderer2.roundedRectangleRight(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, clickAreaRect, p => {
            if (appearance.getAppearance(DefaultAppearance.STROKE_COLOR) === CommonTheme.CONTROL_BORDER_COLOR) {
                p.setStrokeColor(controlBorder);
            } else {
                p.setStrokeColor(ctx.shape);
            }
            
            if (appearance.getAppearance(DefaultAppearance.BACKGROUND_COLOR) === CommonTheme.CONTROL_BACKGROUND_COLOR) {
                p.setBackgroundColor(controlBg);
            } else {
                p.setBackgroundColor(ctx.shape);
            }
        });
    }

    private createIncrementer(ctx: RenderContext, clickSize: number) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        const controlBorder = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        const y = ctx.rect.height * 0.35;
        const x = ctx.rect.right - 0.5 * clickSize;
        const w = clickSize * 0.3;
        const h = clickSize * 0.2;

        const path = `M${x - 0.5 * w},${y} L${x},${y - h},L${x + 0.5 * w},${y} z`;

        ctx.renderer2.path(0, path, p => {
            if (appearance.getAppearance(DefaultAppearance.STROKE_COLOR) === CommonTheme.CONTROL_BORDER_COLOR) {
                p.setBackgroundColor(controlBorder);
            } else {
                p.setBackgroundColor(ctx.shape.strokeColor);
            }
        });
    }

    private createDecrementer(ctx: RenderContext, clickSize: number) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        const controlBorder = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        const y = ctx.rect.height * 0.65;
        const x = ctx.rect.right - 0.5 * clickSize;
        const w = clickSize * 0.3;
        const h = clickSize * 0.2;

        const path = `M${x - 0.5 * w},${y} L${x},${y + h},L${x + 0.5 * w},${y} z`;

        ctx.renderer2.path(0, path, p => {
            if (appearance.getAppearance(DefaultAppearance.STROKE_COLOR) === CommonTheme.CONTROL_BORDER_COLOR) {
                p.setBackgroundColor(controlBorder);
            } else {
                p.setBackgroundColor(ctx.shape.strokeColor);
            }
        });
    }

    private createInputArea(ctx: RenderContext, clickSize: number) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        const inputBg = isDark ? SHAPE_BACKGROUND_COLOR.DARK : 0xffffff;
        const controlBorder = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        const inputAreaRect = new Rect2(0, 0, ctx.rect.width - clickSize + 1, ctx.rect.height);

        ctx.renderer2.roundedRectangleLeft(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, inputAreaRect, p => {
            if (appearance.getAppearance(DefaultAppearance.STROKE_COLOR) === CommonTheme.CONTROL_BORDER_COLOR) {
                p.setStrokeColor(controlBorder);
            } else {
                p.setStrokeColor(ctx.shape);
            }
            p.setBackgroundColor(inputBg);
        });
    }

    private createText(ctx: RenderContext, clickSize: number) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
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
