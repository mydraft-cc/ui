import { DiagramShape } from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_BACKGROUND_COLOR] = 0xFFFFFF;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT_DISABLED] = true;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;

export class Image extends AbstractControl {
    public identifier(): string {
        return 'Image';
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(shapeId, this.identifier(), 100, 100, undefined, DEFAULT_APPEARANCE);
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

        const crossItem = ctx.renderer.createPath(`M${l},${t} L${r},${b} M${l},${b} L${r},${t}`, ctx.shape);

        ctx.renderer.setStrokeColor(crossItem, ctx.shape);
        ctx.renderer.setStrokeStyle(crossItem, 'butt', 'butt');

        ctx.add(crossItem);
    }

    private createBorder(ctx: AbstractContext) {
        const borderItem = ctx.renderer.createRoundedRectangle(ctx.bounds, ctx.shape, 0);

        ctx.renderer.setBackgroundColor(borderItem, ctx.shape);
        ctx.renderer.setStrokeColor(borderItem, ctx.shape);

        ctx.add(borderItem);
    }
}