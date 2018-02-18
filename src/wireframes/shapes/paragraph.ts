import { DiagramShape } from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from './utils/abstract-control';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FOREGROUND_COLOR] = AbstractControl.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT] = 'Lorem ipsum dolor sit amet, alii rebum postea eam ex. Et mei laoreet officiis, summo sensibus id mei.';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT_ALIGNMENT] = 'left';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FONT_SIZE] = AbstractControl.CONTROL_FONT_SIZE;

export class Paragraph extends AbstractControl {
    public identifier(): string {
        return 'Paragraph';
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(this.identifier(), 170, 100, undefined, DEFAULT_APPEARANCE, shapeId);
    }

    protected renderInternal(ctx: AbstractContext) {
        const textItem = ctx.renderer.createMultilineText(ctx.bounds, ctx.shape);

        ctx.add(textItem);
    }
}