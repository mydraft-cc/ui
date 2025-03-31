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

class BorderHeightConstraint implements Constraint {
    public static readonly INSTANCE = new BorderHeightConstraint();

    public updateSize(shape: Shape, size: Vec2): Vec2 {
        const strokeThickness = shape.strokeThickness;

        return new Vec2(size.x, strokeThickness);
    }

    public calculateSizeX(): boolean {
        return false;
    }

    public calculateSizeY(): boolean {
        return true;
    }
}

export class HorizontalLine implements ShapePlugin {
    public identifier(): string {
        return 'HorizontalLine';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 300, y: 2 };
    }

    public previewSize(desiredWidth: number) {
        return { x: desiredWidth, y: 7 };
    }

    public constraint() {
        return BorderHeightConstraint.INSTANCE;
    }

    public render(ctx: RenderContext) {
        ctx.renderer2.rectangle(0, 0, ctx.rect, p => {
            p.setBackgroundColor(ctx.shape.strokeColor);
        });
    }
}
