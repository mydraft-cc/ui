import { Vec2 } from '@app/core';

import { Constraint, DiagramItem } from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';

import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_THICKNESS] = 2;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT_DISABLED] = true;

class BorderHeightConstraint implements Constraint {
    public static readonly INSTANCE = new BorderHeightConstraint();

    public updateSize(shape: DiagramItem, size: Vec2): Vec2 {
        const strokeThickness = shape.appearance.get(DiagramItem.APPEARANCE_STROKE_THICKNESS);

        return new Vec2(size.x, strokeThickness);
    }

    public calculateSizeX(): boolean {
        return false;
    }

    public calculateSizeY(): boolean {
        return true;
    }
}

export class HorizontalLine extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'HorizontalLine';
    }

    public previewOffset() {
        return new Vec2(0, 24);
    }

    public createDefaultShape(shapeId: string): DiagramItem {
        return DiagramItem.createShape(shapeId, this.identifier(), 50, 2, undefined, DEFAULT_APPEARANCE, BorderHeightConstraint.INSTANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        const textItem = ctx.renderer.createRectangle(ctx.shape, 0, ctx.bounds);

        ctx.renderer.setBackgroundColor(textItem, ctx.shape.appearance.get(DiagramItem.APPEARANCE_STROKE_COLOR));

        ctx.add(textItem);
    }
}