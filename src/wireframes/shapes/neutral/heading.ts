import { DiagramItem } from '@app/wireframes/model';

import { AbstractContext, AbstractControl, TextSizeConstraint } from '@app/wireframes/shapes/utils/abstract-control';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT] = 'Heading';
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FONT_SIZE] = 24;

const CONSTRAINT = new TextSizeConstraint(10);

export class Heading extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'Heading';
    }

    public createDefaultShape(shapeId: string): DiagramItem {
        return DiagramItem.createShape(shapeId, this.identifier(), 90, 30, undefined, DEFAULT_APPEARANCE, CONSTRAINT);
    }

    protected renderInternal(ctx: AbstractContext) {
        const textItem = ctx.renderer.createSinglelineText(ctx.shape, ctx.bounds);

        ctx.renderer.setForegroundColor(textItem, ctx.shape);

        ctx.add(textItem);
    }
}