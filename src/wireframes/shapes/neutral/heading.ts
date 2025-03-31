/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConstraintFactory, DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';
import { SHAPE_TEXT_COLOR, getCurrentTheme } from './ThemeShapeUtils';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.FONT_SIZE]: 24,
    [DefaultAppearance.FOREGROUND_COLOR]: SHAPE_TEXT_COLOR.LIGHT,
    [DefaultAppearance.TEXT]: 'Heading',
};

export class Heading implements ShapePlugin {
    public identifier(): string {
        return 'Heading';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 90, y: 35 };
    }

    public constraint(factory: ConstraintFactory) {
        return factory.textSize(10, 10);
    }

    public render(ctx: RenderContext) {
        const appearance = ctx.shape;
        const isDark = getCurrentTheme() === 'dark';
        const textColor = isDark ? SHAPE_TEXT_COLOR.DARK : SHAPE_TEXT_COLOR.LIGHT;
        
        ctx.renderer2.text(ctx.shape, ctx.rect, p => {
            // Use theme-aware text color if the shape has default color
            if (appearance.getAppearance(DefaultAppearance.FOREGROUND_COLOR) === SHAPE_TEXT_COLOR.LIGHT) {
                p.setForegroundColor(textColor);
            } else {
                p.setForegroundColor(ctx.shape);
            }
        }, true);
    }
}
