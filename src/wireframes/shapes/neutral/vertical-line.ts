import { Vec2 } from '@app/core';

import { Constraint, DiagramItem } from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';

import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_THICKNESS] = 2;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT_DISABLED] = true;

class BorderWidthConstraint implements Constraint {
    public static readonly INSTANCE = new BorderWidthConstraint();

    public updateSize(shape: DiagramItem, size: Vec2): Vec2 {
        const strokeThickness = shape.appearance.get(DiagramItem.APPEARANCE_STROKE_THICKNESS);

        return new Vec2(strokeThickness, size.y);
    }

    public calculateSizeX(): boolean {
        return true;
    }

    public calculateSizeY(): boolean {
        return false;
    }
}

export class VerticalLine extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'VerticalLine';
    }

    public previewOffset() {
        return new Vec2(24, 0);
    }

    public createDefaultShape(shapeId: string): DiagramItem {
        return DiagramItem.createShape(shapeId, this.identifier(), 2, 50, undefined, DEFAULT_APPEARANCE, BorderWidthConstraint.INSTANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        const textItem = ctx.renderer.createRectangle(ctx.shape, 0, ctx.bounds);

        ctx.renderer.setBackgroundColor(textItem, ctx.shape.appearance.get(DiagramItem.APPEARANCE_STROKE_COLOR));

        ctx.add(textItem);
    }
}