import { Rect2, Vec2 } from '@app/core';

import { DiagramShape } from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_BACKGROUND_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT] = 'Dropdown';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT_ALIGNMENT] = 'left';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;

export class Dropdown extends AbstractControl {
    public identifier(): string {
        return 'Dropdown';
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(shapeId, this.identifier(), 120, 30, undefined, DEFAULT_APPEARANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        const clickArea = Math.min(40, Math.min(0.8 * ctx.bounds.width, ctx.bounds.height));

        this.createBorder(ctx);
        this.createText(ctx,  clickArea);
        this.createClickTriangle(ctx, clickArea);
    }

    private createClickTriangle(ctx: AbstractContext, clickSize: number) {
        const y = ctx.bounds.height * 0.5;
        const x = ctx.bounds.right - 0.5 * clickSize;
        const w = clickSize * 0.3;
        const h = clickSize * 0.2;

        const triangleItem = ctx.renderer.createPath(`M${x - 0.5 * w},${y - 0.4 * h} L${x},${y + 0.6 * h},L${x + 0.5 * w},${y - 0.4 * h} z`, 0);

        ctx.renderer.setBackgroundColor(triangleItem, ctx.shape.appearance.get(DiagramShape.APPEARANCE_STROKE_COLOR));

        ctx.add(triangleItem);
    }

    private createBorder(ctx: AbstractContext) {
        const borderItem = ctx.renderer.createRoundedRectangle(ctx.bounds, ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS);

        ctx.renderer.setBackgroundColor(borderItem, ctx.shape);
        ctx.renderer.setStrokeColor(borderItem, ctx.shape);

        ctx.add(borderItem);
    }

    private createText(ctx: AbstractContext, clickSize: number) {
        const textAreaBounds =
            new Rect2(
                new Vec2(14, 4),
                new Vec2(
                    Math.max(0, ctx.bounds.width - clickSize - 6),
                    Math.max(0, ctx.bounds.height - 8)));
        const textItem = ctx.renderer.createSinglelineText(textAreaBounds, ctx.shape);

        ctx.renderer.setForegroundColor(textItem, ctx.shape);

        ctx.add(textItem);
    }
}