import { DiagramShape, TextHeightConstraint } from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT] = 'Heading';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FONT_SIZE] = 24;

const CONSTRAINT = new TextHeightConstraint(5);

export class Heading extends AbstractControl {
    public identifier(): string {
        return 'Heading';
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(this.identifier(), 90, 30, undefined, DEFAULT_APPEARANCE, shapeId, CONSTRAINT);
    }

    protected renderInternal(ctx: AbstractContext) {
        const textItem = ctx.renderer.createSinglelineText(ctx.bounds, ctx.shape);

        ctx.renderer.setForegroundColor(textItem, ctx.shape);

        ctx.add(textItem);
    }
}