/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';
import { SHAPE_TEXT_COLOR } from './ThemeShapeUtils';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: 0x000000,
    [DefaultAppearance.STROKE_THICKNESS]: 1,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'left',
    [DefaultAppearance.TEXT]: 'Lorem ipsum dolor sit amet, alii rebum postea eam ex. Et mei laoreet officiis, summo sensibus id mei.',
};

export class Comment implements ShapePlugin {
    public identifier(): string {
        return 'Comment';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 180, y: 170 };
    }

    public render(ctx: RenderContext) {
        const corner = Math.min(14.5, ctx.rect.width, ctx.rect.height) - 0.5;

        this.createBorder(ctx, corner);
        this.createText(ctx);
    }

    private createBorder(ctx: RenderContext, c: number) {
        const isDark = ctx.designThemeMode === 'dark';
        const commentBg = isDark ? 0x786e34 : 0xfff9b7;
        const commentBorder = isDark ? 0x555555 : 0x000000;
        const outerBounds = ctx.renderer2.getOuterBounds(ctx.shape, ctx.rect);

        const l = outerBounds.left;
        const r = outerBounds.right;
        const t = outerBounds.top;
        const b = outerBounds.bottom;

        const path = `M${l + c},${t} L${r},${t} L${r},${b} L${l},${b} L${l},${t + c} L${l + c},${t} z M${l + c},${t} L${l + c},${t + c} L${l},${t + c}`;

        ctx.renderer2.path(ctx.shape, path, p => {
            p.setBackgroundColor(commentBg);
            p.setStrokeColor(commentBorder);
            p.setStrokeStyle('round', 'round');
        });
    }

    private createText(ctx: RenderContext) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        const textColor = isDark ? SHAPE_TEXT_COLOR.DARK : 0x000000;
        
        ctx.renderer2.textMultiline(ctx.shape, ctx.rect.deflate(10, 20), p => {
            if (appearance.getAppearance(DefaultAppearance.FOREGROUND_COLOR) === 0x000000) {
                p.setForegroundColor(textColor);
            } else {
                p.setForegroundColor(ctx.shape);
            }
        });
    }
}
