/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, Rect2, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const OFFSET = { left: 2, top: 30, right: 2, bottom: 1 };

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: 0xFFFFFF,
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
            this.createButtons(ctx);           
        }
    }

    private createWindow(ctx: RenderContext) {
        const windowRect = new Rect2(-OFFSET.left, -OFFSET.top, ctx.rect.width + OFFSET.left + OFFSET.right, ctx.rect.height + OFFSET.top + OFFSET.bottom);

        ctx.renderer2.rectangle(1, 0, windowRect, p => {
            p.setBackgroundColor(CommonTheme.CONTROL_BACKGROUND_COLOR);
            p.setStrokeColor(CommonTheme.CONTROL_BORDER_COLOR);
        });
    }

    private createInner(ctx: RenderContext) {
        ctx.renderer2.rectangle(0, 0, ctx.rect, p => {
            p.setBackgroundColor(ctx.shape);
        });
    }    

    private createButtons(ctx: RenderContext) {
        ctx.renderer2.ellipse(0, new Rect2(10, -20, 12, 12), p => {
            p.setBackgroundColor(0xff0000);
        });

        ctx.renderer2.ellipse(0, new Rect2(30, -20, 12, 12), p => {
            p.setBackgroundColor(0xffff00);
        });

        ctx.renderer2.ellipse(0, new Rect2(50, -20, 12, 12), p => {
            p.setBackgroundColor(0x00ff00);
        });
    }
}
