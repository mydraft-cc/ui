import { DiagramItem } from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_BACKGROUND_COLOR] = 0xFFFFFF;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT_DISABLED] = true;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;

export class Image extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'Image';
    }

    public createDefaultShape(shapeId: string): DiagramItem {
        return DiagramItem.createShape(shapeId, this.identifier(), 100, 100, undefined, DEFAULT_APPEARANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        this.createBorder(ctx);
        this.createCross(ctx);
    }

    private createCross(ctx: AbstractContext) {
        const l = ctx.bounds.left + 0.5;
        const r = ctx.bounds.right - 0.5;
        const t = ctx.bounds.top + 0.5;
        const b = ctx.bounds.bottom - 0.5;

        const crossItem = ctx.renderer.createPath(ctx.shape, `M${l},${t} L${r},${b} M${l},${b} L${r},${t}`);

        ctx.renderer.setStrokeColor(crossItem, ctx.shape);
        ctx.renderer.setStrokeStyle(crossItem, 'butt', 'butt');

        ctx.add(crossItem);
    }

    private createBorder(ctx: AbstractContext) {
        const borderItem = ctx.renderer.createRectangle(ctx.shape, 0, ctx.bounds);

        ctx.renderer.setBackgroundColor(borderItem, ctx.shape);
        ctx.renderer.setStrokeColor(borderItem, ctx.shape);

        ctx.add(borderItem);
    }
}