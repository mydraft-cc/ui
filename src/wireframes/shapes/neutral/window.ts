/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, Rect2, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { SHAPE_BACKGROUND_COLOR } from './ThemeShapeUtils';
import { CommonTheme } from './_theme';

const OFFSET = { left: 2, top: 30, right: 2, bottom: 1 };

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: SHAPE_BACKGROUND_COLOR.LIGHT,
    [DefaultAppearance.TEXT_DISABLED]: true,
};

export class Window implements ShapePlugin {
    public identifier(): string {
        return 'Window';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 320, y: 240 };
    }

    public previewSize() {
        return { x: 400, y: 300 };
    }

    public previewOffset() {
        return OFFSET;
    }

    public render(ctx: RenderContext) {
        this.createWindow(ctx);
        this.createHeader(ctx);
        this.createButtons(ctx);
    }

    private createWindow(ctx: RenderContext) {
        const windowRect = new Rect2(-OFFSET.left, -OFFSET.top, ctx.rect.width + OFFSET.left + OFFSET.right, ctx.rect.height + OFFSET.top + OFFSET.bottom);
        const isDark = ctx.designThemeMode === 'dark';
        const bgColor = isDark ? SHAPE_BACKGROUND_COLOR.DARK : SHAPE_BACKGROUND_COLOR.LIGHT;
        const borderColor = isDark ? 0x555555 : 0xC0C0C0;

        ctx.renderer2.rectangle(1, 0, windowRect, p => {
            if (ctx.shape.getAppearance(DefaultAppearance.BACKGROUND_COLOR) === SHAPE_BACKGROUND_COLOR.LIGHT) {
                p.setBackgroundColor(bgColor);
            } else {
                p.setBackgroundColor(ctx.shape);
            }
            p.setStrokeColor(borderColor);
        });
    }

    private createHeader(ctx: RenderContext) {
        const headerRect = new Rect2(-OFFSET.left, -OFFSET.top, ctx.rect.width + OFFSET.left + OFFSET.right, OFFSET.top);
        const isDark = ctx.designThemeMode === 'dark';
        const headerColor = isDark ? 0x404040 : CommonTheme.CONTROL_BACKGROUND_COLOR;

        ctx.renderer2.rectangle(0, 0, headerRect, p => {
            p.setBackgroundColor(headerColor);
        });
    }

    private createButtons(ctx: RenderContext) {
        const buttonSize = 12;
        const buttonOffset = 6;
        const buttonMargin = 8;

        for (let i = 0; i < 3; i++) {
            const colorOffset = (i * 40);
            const buttonRect = new Rect2(-OFFSET.left + buttonMargin + (i * (buttonSize + buttonOffset)), -OFFSET.top + (OFFSET.top - buttonSize) * 0.5 - 1, buttonSize, buttonSize);

            ctx.renderer2.ellipse(0, buttonRect, p => {
                p.setBackgroundColor(0xE05030 + colorOffset);
            });
        }
    }
}
