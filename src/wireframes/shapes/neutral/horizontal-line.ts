import { Vec2 } from '@appcore';

import { Constraint, DiagramShape } from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';

import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_THICKNESS] = 2;

class BorderHeightConstraint implements Constraint {
    public static readonly INSTANCE = new BorderHeightConstraint();

    public updateSize(shape: DiagramShape, size: Vec2): Vec2 {
        const strokeThickness = shape.appearance.get(DiagramShape.APPEARANCE_STROKE_THICKNESS);

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
    public identifier(): string {
        return 'HorizontalLine';
    }

    public previewOffset() {
        return new Vec2(0, 24);
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(shapeId, this.identifier(), 50, 2, undefined, DEFAULT_APPEARANCE, BorderHeightConstraint.INSTANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        const textItem = ctx.renderer.createRectangle(ctx.shape, 0, ctx.bounds);

        ctx.renderer.setBackgroundColor(textItem, ctx.shape.appearance.get(DiagramShape.APPEARANCE_STROKE_COLOR));

        ctx.add(textItem);
    }
}