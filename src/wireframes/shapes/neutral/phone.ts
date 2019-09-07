import { DiagramItem } from '@app/wireframes/model';

import { Rect2, Vec2 } from '@app/core';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_BACKGROUND_COLOR] = 0xFFFFFF;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT_DISABLED] = true;

export class Phone extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'Phone';
    }

    public previewOffset() {
        return new Vec2(15, 60);
    }

    public createDefaultShape(shapeId: string): DiagramItem {
        return DiagramItem.createShape(shapeId, this.identifier(), 360, 640, undefined, DEFAULT_APPEARANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        this.createHull(ctx);

        if (ctx.bounds.width >= 50 && ctx.bounds.height > 200) {
            this.createScreen(ctx);
            this.createSpeaker(ctx);
        }
    }

    private createHull(ctx: AbstractContext) {
        const hullRect = new Rect2(-15, -60, ctx.bounds.width + 30, ctx.bounds.height + 80);
        const hullItem = ctx.renderer.createRectangle(0, 20, hullRect);

        ctx.renderer.setBackgroundColor(hullItem, 0);

        ctx.add(hullItem);
    }

    private createScreen(ctx: AbstractContext) {
        const screenItem = ctx.renderer.createRectangle(0, 0, ctx.bounds);

        ctx.renderer.setBackgroundColor(screenItem, ctx.shape);

        ctx.add(screenItem);
    }

    private createSpeaker(ctx: AbstractContext) {
        const speakerRect = new Rect2((ctx.bounds.width - 50) * 0.5, -35, 50, 4);
        const speakerItem = ctx.renderer.createRectangle(0, 2, speakerRect);

        ctx.renderer.setBackgroundColor(speakerItem, 0x333333);

        ctx.add(speakerItem);
    }
}