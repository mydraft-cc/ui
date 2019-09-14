import { Rect2 } from '@app/core';

import { DiagramItem } from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_BACKGROUND_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT] = 'ComboBox';
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT_ALIGNMENT] = 'left';
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;

export class ComboBox extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'ComboBox';
    }

    public createDefaultShape(shapeId: string): DiagramItem {
        return DiagramItem.createShape(shapeId, this.identifier(), 140, 30, undefined, DEFAULT_APPEARANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        const clickSize = Math.min(40, Math.min(0.8 * ctx.bounds.width, ctx.bounds.height));

        this.createInputArea(ctx, clickSize);
        this.createText(ctx, clickSize);
        this.createClickArea(ctx, clickSize);
        this.createClickTriangle(ctx, clickSize);
    }

    private createClickArea(ctx: AbstractContext, clickSize: number) {
        const clickAreaRect = new Rect2(ctx.bounds.right - clickSize, 0, clickSize, ctx.bounds.height);
        const clickAreaItem = ctx.renderer.createRoundedRectangleRight(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, clickAreaRect);

        ctx.renderer.setStrokeColor(clickAreaItem, ctx.shape);
        ctx.renderer.setBackgroundColor(clickAreaItem, ctx.shape);

        ctx.add(clickAreaItem);
    }

    private createClickTriangle(ctx: AbstractContext, clickSize: number) {
        const y = ctx.bounds.height * 0.5;
        const x = ctx.bounds.right - 0.5 * clickSize;
        const w = clickSize * 0.3;
        const h = clickSize * 0.2;

        const triangleItem = ctx.renderer.createPath(0, `M${x - 0.5 * w},${y - 0.4 * h} L${x},${y + 0.6 * h},L${x + 0.5 * w},${y - 0.4 * h} z`);

        ctx.renderer.setBackgroundColor(triangleItem, ctx.shape.appearance.get(DiagramItem.APPEARANCE_STROKE_COLOR));

        ctx.add(triangleItem);
    }

    private createInputArea(ctx: AbstractContext, clickSize: number) {
        const inputAreaRect = new Rect2(0, 0, ctx.bounds.width - clickSize + 1, ctx.bounds.height);
        const inputAreaItem = ctx.renderer.createRoundedRectangleLeft(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, inputAreaRect);

        ctx.renderer.setStrokeColor(inputAreaItem, ctx.shape);
        ctx.renderer.setBackgroundColor(inputAreaItem, 0xffffff);

        ctx.add(inputAreaItem);
    }

    private createText(ctx: AbstractContext, clickSize: number) {
        const textRect =
            new Rect2(14, 4,
                Math.max(0, ctx.bounds.width - clickSize - 6),
                Math.max(0, ctx.bounds.height - 8));
        const textItem = ctx.renderer.createSinglelineText(ctx.shape, textRect);

        ctx.renderer.setForegroundColor(textItem, ctx.shape);

        ctx.add(textItem);
    }
}