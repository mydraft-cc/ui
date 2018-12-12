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
        const hullItem = ctx.renderer.createRectangle(0, 20, ctx.bounds);

        ctx.renderer.setBackgroundColor(hullItem, 0);

        ctx.add(hullItem);

        if (ctx.bounds.width >= 50 && ctx.bounds.height > 200) {
            this.createDisplay(ctx);
            this.createSpeaker(ctx);
        }
    }

    private createDisplay(ctx: AbstractContext) {
        const displayRect = new Rect2(20, 100, ctx.bounds.width - 40, ctx.bounds.height - 180);
        const displayItem = ctx.renderer.createRectangle(0, 0, displayRect);

        ctx.renderer.setBackgroundColor(displayItem, ctx.shape);

        ctx.add(displayItem);
    }

    private createSpeaker(ctx: AbstractContext) {
        const speakerRect = new Rect2((ctx.bounds.width - 50) * 0.5, 48, 50, 4);
        const speakerItem = ctx.renderer.createRectangle(0, 2, speakerRect);

        ctx.renderer.setBackgroundColor(speakerItem, 0x333333);

        ctx.add(speakerItem);
    }
}