/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, Rect2, RenderContext, ShapePlugin, Vec2 } from '@app/wireframes/interface';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.BACKGROUND_COLOR] = 0xFFFFFF;
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_DISABLED] = true;

export class Phone implements ShapePlugin {
    public identifier(): string {
        return 'Phone';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 360, y: 640 };
    }

    public previewOffset() {
        return new Vec2(15, 60);
    }

    public render(ctx: RenderContext) {
        this.createHull(ctx);

        if (ctx.rect.width >= 50 && ctx.rect.height > 200) {
            this.createScreen(ctx);
            this.createSpeaker(ctx);
        }
    }

    private createHull(ctx: RenderContext) {
        const hullRect = new Rect2(-15, -60, ctx.rect.width + 30, ctx.rect.height + 80);

        ctx.renderer2.rectangle(0, 20, hullRect, p => {
            p.setBackgroundColor(0);
        });
    }

    private createScreen(ctx: RenderContext) {
        ctx.renderer2.rectangle(0, 0, ctx.rect, p => {
            p.setBackgroundColor(ctx.shape);
        });
    }

    private createSpeaker(ctx: RenderContext) {
        const speakerRect = new Rect2((ctx.rect.width - 50) * 0.5, -35, 50, 4);

        ctx.renderer2.rectangle(0, 2, speakerRect, p => {
            p.setBackgroundColor(0x333333);
        });
    }
}
