import { DiagramShape } from '@app/wireframes/model';

import { Rect2, Vec2 } from '@app/core';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_BACKGROUND_COLOR] = 0xFFFFFF;

export class Phone extends AbstractControl {
    public identifier(): string {
        return 'Phone';
    }

    public previewOffset() {
        return new Vec2(20, 80);
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(shapeId, this.identifier(), 360, 640, undefined, DEFAULT_APPEARANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        const hullRect = new Rect2(-20, -80, ctx.bounds.width + 40, ctx.bounds.height + 140);
        const hullItem = ctx.renderer.createRectangle(0, 20, hullRect);

        ctx.renderer.setBackgroundColor(hullItem, 0);

        ctx.add(hullItem);

        if (ctx.bounds.width >= 50 && ctx.bounds.height > 200) {
            this.createScreen(ctx);
            this.createSpeaker(ctx);
        }
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