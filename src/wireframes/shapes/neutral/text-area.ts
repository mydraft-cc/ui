import { DiagramItem } from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_BACKGROUND_COLOR] = 0xFFFFFF;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT] = 'TextArea';
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT_ALIGNMENT] = 'left';
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;

export class TextArea extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'TextArea';
    }

    public createDefaultShape(shapeId: string): DiagramItem {
        return DiagramItem.createShape(shapeId, this.identifier(), 160, 60, undefined, DEFAULT_APPEARANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        this.createBorder(ctx);
        this.createText(ctx);
    }

    private createBorder(ctx: AbstractContext) {
        const borderItem = ctx.renderer.createRectangle(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, ctx.bounds);

        ctx.renderer.setBackgroundColor(borderItem, ctx.shape);
        ctx.renderer.setStrokeColor(borderItem, ctx.shape);

        ctx.add(borderItem);
    }

    private createText(ctx: AbstractContext) {
        const textItem = ctx.renderer.createMultilineText(ctx.shape, ctx.bounds.deflate(14, 4));

        ctx.renderer.setForegroundColor(textItem, ctx.shape);

        ctx.add(textItem);
    }
}