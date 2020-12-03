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
        const hullItem = ctx.renderer.createRectangle(0, 20, hullRect);

        ctx.renderer.setBackgroundColor(hullItem, 0);

        ctx.add(hullItem);
    }

    private createScreen(ctx: RenderContext) {
        const screenItem = ctx.renderer.createRectangle(0, 0, ctx.rect);

        ctx.renderer.setBackgroundColor(screenItem, ctx.shape);

        ctx.add(screenItem);
    }

    private createSpeaker(ctx: RenderContext) {
        const speakerRect = new Rect2((ctx.rect.width - 50) * 0.5, -35, 50, 4);
        const speakerItem = ctx.renderer.createRectangle(0, 2, speakerRect);

        ctx.renderer.setBackgroundColor(speakerItem, 0x333333);

        ctx.add(speakerItem);
    }
}
