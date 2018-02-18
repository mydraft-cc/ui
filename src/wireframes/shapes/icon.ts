import { DiagramShape } from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from './utils/abstract-control';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FOREGROUND_COLOR] = AbstractControl.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT_DISABLED] = true;

export class Icon extends AbstractControl {
    public identifier(): string {
        return 'Icon';
    }

    public showInGallery() {
        return false;
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(this.identifier(), 40, 40, undefined, DEFAULT_APPEARANCE, shapeId);
    }

    protected renderInternal(ctx: AbstractContext) {
        const fontSize = Math.min(ctx.bounds.size.x, ctx.bounds.size.y) - 16;

        const config = { fontSize, text: ctx.shape.appearance.get(DiagramShape.APPEARANCE_TEXT), alignment: 'center' };

        const textItem = ctx.renderer.createSinglelineText(ctx.bounds, config);

        ctx.renderer.setForegroundColor(textItem, ctx.shape);
        ctx.renderer.setFontFamily(textItem, 'FontAwesome');

        ctx.add(textItem);
    }
}