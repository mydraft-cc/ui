import { DiagramShape } from '@app/wireframes/model';

import { Rect2 } from '@app/core';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_BACKGROUND_COLOR] = 0xFFFFFF;

export class Phone extends AbstractControl {
    public identifier(): string {
        return 'Phone';
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(shapeId, this.identifier(), 480, 860, undefined, DEFAULT_APPEARANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        const hullItem = ctx.renderer.createRoundedRectangle(ctx.bounds, ctx.shape, 20);

        ctx.renderer.setBackgroundColor(hullItem, 0);

        ctx.add(hullItem);

        if (ctx.bounds.width >= 50 && ctx.bounds.height > 200) {
            this.createDisplay(ctx);
            this.createSpeaker(ctx);
        }
    }

    private createDisplay(ctx: AbstractContext) {
        const displayRect = Rect2.create(20, 100, ctx.bounds.width - 40, ctx.bounds.height - 180);
        const displayItem = ctx.renderer.createRoundedRectangle(displayRect, 0, 0);

        ctx.renderer.setBackgroundColor(displayItem, ctx.shape);

        ctx.add(displayItem);
    }

    private createSpeaker(ctx: AbstractContext) {
        const speakerRect = Rect2.create((ctx.bounds.width - 50) * 0.5, 48, 50, 4);
        const speakerItem = ctx.renderer.createRoundedRectangle(speakerRect, 0, 2);

        ctx.renderer.setBackgroundColor(speakerItem, 0x333333);

        ctx.add(speakerItem);
    }
}