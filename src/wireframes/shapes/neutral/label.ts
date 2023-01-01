/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/
import { ConstraintFactory, DefaultAppearance, RenderContext, ShapePlugin, ShapeSource } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: CommonTheme.CONTROL_TEXT_COLOR,
    [DefaultAppearance.TEXT]: 'Label',
};

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

    public create(source: ShapeSource) {
        if (source.type == 'Text') {
            const { text } = source;

            return {
                renderer: this.identifier(),
                appearance: {
                    [DefaultAppearance.TEXT]: text,
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
        }, true);
    }
}
