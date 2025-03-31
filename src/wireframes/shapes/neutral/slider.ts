/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConfigurableFactory, ConstraintFactory, DefaultAppearance, Rect2, RenderContext, ShapePlugin, Vec2 } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';
import { getCurrentTheme } from './ThemeShapeUtils';

const THUMB_COLOR = 'ACCENT_COLOR';
const THUMB_VALUE = 'VALUE';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: CommonTheme.CONTROL_BACKGROUND_COLOR,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: 0xffffff,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
    [DefaultAppearance.TEXT_DISABLED]: true,
    [THUMB_COLOR]: 0x2171b5,
    [THUMB_VALUE]: 50,
};

const HEIGHT_TOTAL = 20;
const HEIGHT_BORDER = 8;

export class Slider implements ShapePlugin {
    public identifier(): string {
        return 'Slider';
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
            factory.slider(THUMB_VALUE, 'Value', 0, 100),
            factory.color(THUMB_COLOR, 'Accent Color'),
        ];
    }

    public render(ctx: RenderContext) {
        const sliderRect = new Rect2(HEIGHT_TOTAL * 0.5, (HEIGHT_TOTAL - HEIGHT_BORDER) * 0.5, ctx.rect.width - HEIGHT_TOTAL, HEIGHT_BORDER);

        const relative = ctx.shape.getAppearance(THUMB_VALUE) / 100;

        this.createBackground(ctx, sliderRect, relative);
        this.createBorder(ctx, sliderRect);
        this.createThumb(ctx, relative);
    }

    private createThumb(ctx: RenderContext, relative: number) {
        const appearance = ctx.shape;
        const isDark = getCurrentTheme() === 'dark';
        const thumbBg = isDark ? 0xe0e0e0 : 0xffffff;
        const controlBorder = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        const thumbCenter = new Vec2(ctx.rect.x + ctx.rect.width * relative, 0.5 * HEIGHT_TOTAL);

        ctx.renderer2.ellipse(ctx.shape, Rect2.fromCenter(thumbCenter, 0.5 * HEIGHT_TOTAL), p => {
            if (appearance.getAppearance(DefaultAppearance.STROKE_COLOR) === CommonTheme.CONTROL_BORDER_COLOR) {
                p.setStrokeColor(controlBorder);
            } else {
                p.setStrokeColor(ctx.shape);
            }
            
            if (appearance.getAppearance(DefaultAppearance.FOREGROUND_COLOR) === 0xffffff) {
                p.setBackgroundColor(thumbBg);
            } else {
                p.setBackgroundColor(ctx.shape.foregroundColor);
            }
        });
    }

    private createBackground(ctx: RenderContext, bounds: Rect2, relative: number) {
        const appearance = ctx.shape;
        const isDark = getCurrentTheme() === 'dark';
        const controlBg = isDark ? 0x333333 : CommonTheme.CONTROL_BACKGROUND_COLOR;
        
        // Adjust accent color for dark theme
        let accentColorValue = appearance.getAppearance(THUMB_COLOR);
        if (isDark && accentColorValue === 0x2171b5) {
            accentColorValue = 0x3182bd; // Slightly brighter blue for dark theme
        }
        
        ctx.renderer2.group(items => {
            const activeRect = new Rect2(bounds.x, bounds.y, bounds.width * relative, bounds.height);

            // Active item.
            items.rectangle(0, 0, activeRect, p => {
                p.setBackgroundColor(accentColorValue);
            });

            const inactiveRect = new Rect2(bounds.x + bounds.width * relative, bounds.top, bounds.width * (1 - relative), bounds.height);

            // Inactive item
            ctx.renderer2.rectangle(0, 0, inactiveRect, p => {
                if (appearance.getAppearance(DefaultAppearance.BACKGROUND_COLOR) === CommonTheme.CONTROL_BACKGROUND_COLOR) {
                    p.setBackgroundColor(controlBg);
                } else {
                    p.setBackgroundColor(ctx.shape);
                }
            });
        }, clip => {
            clip.rectangle(0, bounds.height * 0.5, bounds);
        });
    }

    private createBorder(ctx: RenderContext, bounds: Rect2) {
        const appearance = ctx.shape;
        const isDark = getCurrentTheme() === 'dark';
        const controlBorder = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        
        ctx.renderer2.rectangle(ctx.shape, bounds.height * 0.5, bounds, p => {
            if (appearance.getAppearance(DefaultAppearance.STROKE_COLOR) === CommonTheme.CONTROL_BORDER_COLOR) {
                p.setStrokeColor(controlBorder);
            } else {
                p.setStrokeColor(ctx.shape);
            }
        });
    }
}
