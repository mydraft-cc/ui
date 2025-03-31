/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Constraint, DefaultAppearance, RenderContext, Shape, ShapePlugin, Vec2 } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: 2,
    [DefaultAppearance.TEXT_DISABLED]: true,
};

class BorderWidthConstraint implements Constraint {
    public static readonly INSTANCE = new BorderWidthConstraint();

    public updateSize(shape: Shape, size: Vec2): Vec2 {
        const strokeThickness = shape.strokeThickness;

        return new Vec2(strokeThickness, size.y);
    }

    public calculateSizeX(): boolean {
        return true;
    }

    public calculateSizeY(): boolean {
        return false;
    }
}

export class VerticalLine implements ShapePlugin {
    public identifier(): string {
        return 'VerticalLine';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 2, y: 300 };
    }

    public previewSize(_: number, desiredHeight: number) {
        return { x: 8, y: desiredHeight };
    }

    public constraint() {
        return BorderWidthConstraint.INSTANCE;
    }

    public render(ctx: RenderContext) {
        ctx.renderer2.rectangle(0, 0, ctx.rect, p => {
            p.setBackgroundColor(ctx.shape.strokeColor);
        });
    }
}
