/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConstraintFactory, DefaultAppearance, RenderContext, ShapePlugin, ShapeSource } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';
import { getCurrentTheme } from './ThemeShapeUtils';

// Theme-aware link colors
const LINK_COLOR = {
    LIGHT: 0x08519c,
    DARK: 0x4a9eff,
};

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: CommonTheme.CONTROL_BACKGROUND_COLOR,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: LINK_COLOR.LIGHT,
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
        const appearance = ctx.shape;
        const isDark = getCurrentTheme() === 'dark';
        const linkColor = isDark ? LINK_COLOR.DARK : LINK_COLOR.LIGHT;
        
        ctx.renderer2.text(ctx.shape, ctx.rect, p => {
            // Use theme-aware link color if the shape has default color
            if (appearance.getAppearance(DefaultAppearance.FOREGROUND_COLOR) === LINK_COLOR.LIGHT) {
                p.setForegroundColor(linkColor);
            } else {
                p.setForegroundColor(ctx.shape);
            }
            p.setTextDecoration('underline');
        });
    }
}
