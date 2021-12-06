/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Constraint, DefaultAppearance, RenderContext, Shape, ShapePlugin, Vec2 } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_THICKNESS] = 2;
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_DISABLED] = true;

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
        return { x: 50, y: 2 };
    }

    public constraint() {
        return BorderHeightConstraint.INSTANCE;
    }

    public previewOffset() {
        return new Vec2(0, 24);
    }

    public render(ctx: RenderContext) {
        ctx.renderer2.rectangle(ctx.shape, 0, ctx.rect, p => {
            p.setBackgroundColor(ctx.shape.strokeColor);
        });
    }
}
