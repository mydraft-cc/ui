import { DiagramShape } from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from './utils/abstract-control';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FOREGROUND_COLOR] = AbstractControl.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_BACKGROUND_COLOR] = 0xFFFFFF;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT] = 'TextInput';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT_ALIGNMENT] = 'left';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FONT_SIZE] = AbstractControl.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_COLOR] = AbstractControl.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_THICKNESS] = AbstractControl.CONTROL_BORDER_THICKNESS;

export class TextInput extends AbstractControl {
    public identifier(): string {
        return 'TextInput';
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(this.identifier(), 100, 30, undefined, DEFAULT_APPEARANCE, shapeId);
    }

    protected renderInternal(ctx: AbstractContext) {
        this.createBorder(ctx);
        this.createText(ctx);
    }

    private createBorder(ctx: AbstractContext) {
        const borderItem = ctx.renderer.createRoundedRectangle(ctx.bounds, ctx.shape, AbstractControl.CONTROL_BORDER_RADIUS);

        ctx.renderer.setBackgroundColor(borderItem, ctx.shape);
        ctx.renderer.setStrokeColor(borderItem, ctx.shape);

        ctx.add(borderItem);
    }

    private createText(ctx: AbstractContext) {
        const textItem = ctx.renderer.createSinglelineText(ctx.bounds.deflate(14, 4), ctx.shape);

        ctx.renderer.setForegroundColor(textItem, ctx.shape);

        ctx.add(textItem);
    }
}