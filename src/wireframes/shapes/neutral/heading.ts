/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConstraintFactory, DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.TEXT] = 'Heading';
DEFAULT_APPEARANCE[DefaultAppearance.FONT_SIZE] = 24;

export class Heading implements ShapePlugin {
    public identifier(): string {
        return 'Heading';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 90, y: 30 };
    }

    public constraint(factory: ConstraintFactory) {
        return factory.textSize(10);
    }

    public render(ctx: RenderContext) {
        ctx.renderer2.text(ctx.shape, ctx.rect, p => {
            p.setForegroundColor(ctx.shape);
        });
    }
}
