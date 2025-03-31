/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, Rect2, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';
import { SHAPE_BACKGROUND_COLOR, getCurrentTheme } from './ThemeShapeUtils';

const OFFSET = { left: 4, top: 70, right: 4, bottom: 15 };

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: 0xFFFFFF,
    [DefaultAppearance.TEXT_DISABLED]: true,
};

const REFRESH_CODE = String.fromCharCode(0xf021);

export class Browser implements ShapePlugin {
    public identifier(): string {
        return 'Browser';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 800, y: 600 };
    }

    public previewSize() {
        return { x: 400, y: 300 };
    }

    public previewOffset() {
        return OFFSET;
    }

    public render(ctx: RenderContext) {
        this.createWindow(ctx);

        if (ctx.rect.width >= 50 && ctx.rect.height > 200) {
            this.createInner(ctx);
            this.createSearch(ctx);
            this.createButtons(ctx);
            this.createIcon(ctx);
        }
    }

    private createWindow(ctx: RenderContext) {
        const isDark = getCurrentTheme() === 'dark';
        const controlBg = isDark ? 0x333333 : CommonTheme.CONTROL_BACKGROUND_COLOR;
        const controlBorder = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        const windowRect = new Rect2(-OFFSET.left, -OFFSET.top, ctx.rect.width + OFFSET.left + OFFSET.right, ctx.rect.height + OFFSET.top + OFFSET.bottom);

        ctx.renderer2.rectangle(1, 0, windowRect, p => {
            p.setBackgroundColor(controlBg);
            p.setStrokeColor(controlBorder);
        });
    }

    private createInner(ctx: RenderContext) {
        const appearance = ctx.shape;
        const isDark = getCurrentTheme() === 'dark';
        const bgColor = isDark ? SHAPE_BACKGROUND_COLOR.DARK : 0xFFFFFF;
        
        ctx.renderer2.rectangle(0, 0, ctx.rect, p => {
            if (appearance.getAppearance(DefaultAppearance.BACKGROUND_COLOR) === 0xFFFFFF) {
                p.setBackgroundColor(bgColor);
            } else {
                p.setBackgroundColor(ctx.shape);
            }
        });
    }

    private createSearch(ctx: RenderContext) {
        const isDark = getCurrentTheme() === 'dark';
        const controlBorder = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        const searchBg = isDark ? 0x222222 : 0xffffff;
        const searchRect = new Rect2(50, -34, ctx.rect.width - 50, 30);

        ctx.renderer2.rectangle(1, 15, searchRect, p => {
            p.setBackgroundColor(searchBg);
            p.setStrokeColor(controlBorder);
        });
    }

    private createIcon(ctx: RenderContext) {
        const isDark = getCurrentTheme() === 'dark';
        const iconColor = isDark ? 0xaaaaaa : 0x555555;
        const iconRect = new Rect2(5, -34, 30, 30);

        ctx.renderer2.text({ fontSize: 20, text: REFRESH_CODE, alignment: 'center' }, iconRect, p => {
            p.setForegroundColor(iconColor);
            p.setFontFamily('FontAwesome');
        });
    }

    private createButtons(ctx: RenderContext) {
        ctx.renderer2.ellipse(0, new Rect2(10, -50, 12, 12), p => {
            p.setBackgroundColor(0xff0000);
        });

        ctx.renderer2.ellipse(0, new Rect2(30, -50, 12, 12), p => {
            p.setBackgroundColor(0xffff00);
        });

        ctx.renderer2.ellipse(0, new Rect2(50, -50, 12, 12), p => {
            p.setBackgroundColor(0x00ff00);
        });
    }
}
