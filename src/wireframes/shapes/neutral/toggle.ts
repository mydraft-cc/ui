/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

// tslint:disable: prefer-const

import { ConfigurableFactory, DefaultAppearance, Rect2, RenderContext, ShapePlugin, Vec2 } from '@app/wireframes/interface';
import { getCurrentTheme } from './ThemeShapeUtils';

const STATE = 'STATE';
const STATE_NORMAL = 'Normal';
const STATE_CHECKED = 'Checked';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: 0xbdbdbd,
    [DefaultAppearance.FOREGROUND_COLOR]: 0x238b45,
    [DefaultAppearance.STROKE_COLOR]: 0xffffff,
    [DefaultAppearance.STROKE_THICKNESS]: 4,
    [DefaultAppearance.TEXT_DISABLED]: true,
    [STATE]: STATE_CHECKED,
};

export class Toggle implements ShapePlugin {
    public identifier(): string {
        return 'Toggle';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 60, y: 30 };
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.selection(STATE, 'State', [
                STATE_NORMAL,
                STATE_CHECKED,
            ]),
        ];
    }

    public render(ctx: RenderContext) {
        const appearance = ctx.shape;
        const isDark = getCurrentTheme() === 'dark';
        const border = ctx.shape.strokeThickness;
        const radius = Math.min(ctx.rect.width, ctx.rect.height) * 0.5;
        const isUnchecked = ctx.shape.getAppearance(STATE) === STATE_NORMAL;
        const circleY = ctx.rect.height * 0.5;
        const circleX = isUnchecked ? radius : ctx.rect.width - radius;
        const circleCenter = new Vec2(circleX, circleY);
        const circleSize = radius - border;
        
        // Theme-aware colors
        const toggleBgNormal = isDark ? 0x555555 : 0xbdbdbd;
        const toggleFgActive = isDark ? 0x32a35a : 0x238b45;
        const toggleCircle = isDark ? 0xe0e0e0 : 0xffffff;
        
        // Use theme-aware colors if default values are used
        const bgColor = appearance.getAppearance(DefaultAppearance.BACKGROUND_COLOR) === 0xbdbdbd ? 
            toggleBgNormal : appearance.getAppearance(DefaultAppearance.BACKGROUND_COLOR);
            
        const fgColor = appearance.getAppearance(DefaultAppearance.FOREGROUND_COLOR) === 0x238b45 ? 
            toggleFgActive : appearance.getAppearance(DefaultAppearance.FOREGROUND_COLOR);
            
        const strokeColor = appearance.getAppearance(DefaultAppearance.STROKE_COLOR) === 0xffffff ? 
            toggleCircle : appearance.getAppearance(DefaultAppearance.STROKE_COLOR);

        const barColor = isUnchecked ? bgColor : fgColor;

        // Pill
        ctx.renderer2.rectangle(0, radius, ctx.rect, p => {
            p.setBackgroundColor(barColor);
        });

        // Circle
        ctx.renderer2.ellipse(0, Rect2.fromCenter(circleCenter, circleSize), p => {
            p.setBackgroundColor(strokeColor);
        });
    }
}
