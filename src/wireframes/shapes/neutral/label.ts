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
DEFAULT_APPEARANCE[DefaultAppearance.TEXT] = 'Label';
DEFAULT_APPEARANCE[DefaultAppearance.FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;

export class Label implements ShapePlugin {
    public identifier(): string {
        return 'Label';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 46, y: 30 };
    }

    public constraint(factory: ConstraintFactory) {
        return factory.textSize(5);
    }

    public render(ctx: RenderContext) {
        const textItem = ctx.renderer.createSinglelineText(ctx.shape, ctx.rect);

        ctx.renderer.setForegroundColor(textItem, ctx.shape);

        ctx.add(textItem);
    }
}
