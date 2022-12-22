/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConstraintFactory, DefaultAppearance, RenderContext, ShapePlugin, ShapeSource } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: CommonTheme.CONTROL_BACKGROUND_COLOR,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: 0x08519c,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'center',
    [DefaultAppearance.TEXT]: 'Link',
};

export class Link implements ShapePlugin {
    public identifier(): string {
        return 'Link';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 40, y: 30 };
    }

    public create(source: ShapeSource) {
        if (source.type == 'Url') {
            const { url } = source;

            return {
                renderer: this.identifier(),
                appearance: {
                    [DefaultAppearance.TEXT]: url,
                },
            };
        }

        return null;
    }

    public constraint(factory: ConstraintFactory) {
        return factory.textSize(5, 5);
    }

    public render(ctx: RenderContext) {
        ctx.renderer2.text(ctx.shape, ctx.rect, p => {
            p.setForegroundColor(ctx.shape);
            p.setTextDecoration('underline');
        });
    }
}
