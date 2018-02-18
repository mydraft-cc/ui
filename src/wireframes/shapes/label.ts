import { DiagramShape, TextHeightConstraint } from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from './utils/abstract-control';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FOREGROUND_COLOR] = AbstractControl.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT] = 'Label';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FONT_SIZE] = AbstractControl.CONTROL_FONT_SIZE;

const CONSTRAINT = new TextHeightConstraint(5);

export class Label extends AbstractControl {
    public identifier(): string {
        return 'Label';
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(this.identifier(), 46, 30, undefined, DEFAULT_APPEARANCE, shapeId, CONSTRAINT);
    }

    protected renderInternal(ctx: AbstractContext) {
        const textItem = ctx.renderer.createSinglelineText(ctx.bounds, ctx.shape);

        ctx.renderer.setForegroundColor(textItem, ctx.shape);

        ctx.add(textItem);
    }
}