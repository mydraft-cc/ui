/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConfigurableFactory, ConstraintFactory, DefaultAppearance, Rect2, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';
import { getCurrentTheme } from './ThemeShapeUtils';

const BAR_COLOR = 'ACCENT_COLOR';
const BAR_VALUE = 'VALUE';

const DEFAULT_APPEARANCE = {
    [BAR_COLOR]: 0x2171b5,
    [BAR_VALUE]: 50,
    [DefaultAppearance.BACKGROUND_COLOR]: CommonTheme.CONTROL_BACKGROUND_COLOR,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: 0xffffff,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
    [DefaultAppearance.TEXT_DISABLED]: true,
};

const HEIGHT_TOTAL = 16;

export class Progress implements ShapePlugin {
    public identifier(): string {
        return 'Progress';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 150, y: HEIGHT_TOTAL };
    }

    public constraint(factory: ConstraintFactory) {
        return factory.size(undefined, HEIGHT_TOTAL);
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.slider(BAR_VALUE, 'Value', 0, 100),
            factory.color(BAR_COLOR, 'Accent Color'),
        ];
    }

    public render(ctx: RenderContext) {
        this.createBackground(ctx);
        this.createBorder(ctx);
    }

    private createBackground(ctx: RenderContext) {
        const appearance = ctx.shape;
        const isDark = getCurrentTheme() === 'dark';
        const controlBg = isDark ? 0x333333 : CommonTheme.CONTROL_BACKGROUND_COLOR;
        
        // Adjust accent color for dark theme
        let accentColorValue = appearance.getAppearance(BAR_COLOR);
        if (isDark && accentColorValue === 0x2171b5) {
            accentColorValue = 0x3182bd; // Slightly brighter blue for dark theme
        }
        
        const relative = ctx.shape.getAppearance(BAR_VALUE) / 100;

        ctx.renderer2.group(items => {
            const activeBounds = new Rect2(ctx.rect.x, ctx.rect.y, ctx.rect.width * relative, ctx.rect.height);

            // Active area
            ctx.renderer2.rectangle(0, 0, activeBounds, p => {
                p.setBackgroundColor(accentColorValue);
            });

            const inactiveBounds = new Rect2(ctx.rect.width * relative, ctx.rect.top, ctx.rect.width * (1 - relative), ctx.rect.height);

            // Inactive area.
            items.rectangle(0, 0, inactiveBounds, p => {
                if (appearance.getAppearance(DefaultAppearance.BACKGROUND_COLOR) === CommonTheme.CONTROL_BACKGROUND_COLOR) {
                    p.setBackgroundColor(controlBg);
                } else {
                    p.setBackgroundColor(ctx.shape);
                }
            });
        }, clip => {
            clip.rectangle(0, ctx.rect.height * 0.5, ctx.rect);
        });
    }

    private createBorder(ctx: RenderContext) {
        const appearance = ctx.shape;
        const isDark = getCurrentTheme() === 'dark';
        const controlBorder = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        
        ctx.renderer2.rectangle(ctx.shape, ctx.rect.height * 0.5, ctx.rect, p => {
            if (appearance.getAppearance(DefaultAppearance.STROKE_COLOR) === CommonTheme.CONTROL_BORDER_COLOR) {
                p.setStrokeColor(controlBorder);
            } else {
                p.setStrokeColor(ctx.shape);
            }
        });
    }
}
