/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, Rect2, RenderContext, ShapePlugin, Vec2 } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.BACKGROUND_COLOR] = 0xFFFFFF;
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_DISABLED] = true;

const refreshCode = String.fromCharCode(0xf021);

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

    public previewOffset() {
        return new Vec2(4, 70);
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
        const windowRect = new Rect2(-4, -70, ctx.rect.width + 8, ctx.rect.height + 85);
        const windowItem = ctx.renderer.createRectangle(1, 0, windowRect);

        ctx.renderer.setBackgroundColor(windowItem, CommonTheme.CONTROL_BACKGROUND_COLOR);
        ctx.renderer.setStrokeColor(windowItem, CommonTheme.CONTROL_BORDER_COLOR);

        ctx.add(windowItem);
    }

    private createInner(ctx: RenderContext) {
        const screenItem = ctx.renderer.createRectangle(0, 0, ctx.rect);

        ctx.renderer.setBackgroundColor(screenItem, ctx.shape);

        ctx.add(screenItem);
    }

    private createSearch(ctx: RenderContext) {
        const searchRect = new Rect2(50, -34, ctx.rect.width - 50, 30);
        const searchItem = ctx.renderer.createRectangle(1, 15, searchRect);

        ctx.renderer.setBackgroundColor(searchItem, 0xffffff);
        ctx.renderer.setStrokeColor(searchItem, CommonTheme.CONTROL_BORDER_COLOR);

        ctx.add(searchItem);
    }

    private createIcon(ctx: RenderContext) {
        const iconRect = new Rect2(5, -34, 30, 30);
        const iconItem = ctx.renderer.createSinglelineText({ fontSize: 20, text: refreshCode, alignment: 'center' }, iconRect);

        ctx.renderer.setForegroundColor(iconItem, 0x555555);
        ctx.renderer.setFontFamily(iconItem, 'FontAwesome');

        ctx.add(iconItem);
    }

    private createButtons(ctx: RenderContext) {
        const button1 = ctx.renderer.createEllipse(0, new Rect2(10, -50, 12, 12));
        const button2 = ctx.renderer.createEllipse(0, new Rect2(30, -50, 12, 12));
        const button3 = ctx.renderer.createEllipse(0, new Rect2(50, -50, 12, 12));

        ctx.renderer.setBackgroundColor(button1, 0xff0000);
        ctx.renderer.setBackgroundColor(button2, 0xffff00);
        ctx.renderer.setBackgroundColor(button3, 0x00ff00);

        ctx.add(button1);
        ctx.add(button2);
        ctx.add(button3);
    }
}
