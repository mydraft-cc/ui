/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConfigurableFactory, DefaultAppearance, Rect2, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const ARROW_COLOR = 'ARROW_COLOR';
const THUMB_COLOR = 'BAR_COLOR';
const THUMB_POSITION = 'BAR_POSITION';
const THUMB_SIZE = 'BAR_SIZE';

const DEFAULT_APPEARANCE = {
    [ARROW_COLOR]: 0xbdbdbd,
    [DefaultAppearance.BACKGROUND_COLOR]: CommonTheme.CONTROL_BACKGROUND_COLOR,
    [DefaultAppearance.FOREGROUND_COLOR]: CommonTheme.CONTROL_TEXT_COLOR,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BACKGROUND_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: 2,
    [DefaultAppearance.TEXT_DISABLED]: true,
    [THUMB_COLOR]: 0xbdbdbd,
    [THUMB_POSITION]: 0,
    [THUMB_SIZE]: 50,
};

export class VerticalScrollbar implements ShapePlugin {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'VerticalScrollbar';
    }

    public defaultSize() {
        return { x: 20, y: 300 };
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.color(THUMB_COLOR, 'Thumb Color'),
            factory.slider(THUMB_SIZE, 'Thumb Size', 0, 100),
            factory.slider(THUMB_POSITION, 'Thumb Position', 0, 100),
            factory.color(ARROW_COLOR, 'Arrow Color'),
        ];
    }

    public render(ctx: RenderContext) {
        const clickSize = Math.min(30, Math.min(0.8 * ctx.rect.height, ctx.rect.width));

        this.createBackground(ctx, clickSize);
        this.createBorder(ctx);
        this.createTopTriangle(ctx, clickSize);
        this.createBottomTriangle(ctx, clickSize);
    }

    private createBackground(ctx: RenderContext, clickSize: number) {
        const appearance = ctx.shape;
        // Use context theme
        const isDark = ctx.designThemeMode === 'dark';
        const controlBg = isDark ? 0x333333 : CommonTheme.CONTROL_BACKGROUND_COLOR;
        
        // Adjust colors for dark theme
        const thumbDefault = isDark ? 0x666666 : 0xbdbdbd;
        let thumbColor = appearance.getAppearance(THUMB_COLOR);
        if (thumbColor === 0xbdbdbd && isDark) {
            thumbColor = thumbDefault;
        }
        
        ctx.renderer2.group(items => {
            // Rail
            items.rectangle(0, 0, ctx.rect, p => {
                 // Use appearance background if set, otherwise use theme default
                if (appearance.getAppearance(DefaultAppearance.BACKGROUND_COLOR) != null && appearance.getAppearance(DefaultAppearance.BACKGROUND_COLOR) !== CommonTheme.CONTROL_BACKGROUND_COLOR) {
                    p.setBackgroundColor(ctx.shape);
                } else {
                    p.setBackgroundColor(controlBg);
                }
            });

            const barHeight = appearance.getAppearance(THUMB_SIZE) / 100;
            const barOffset = appearance.getAppearance(THUMB_POSITION) / 100 * (ctx.rect.height - 2 * clickSize) * (1 - barHeight);
            
            const barRect = new Rect2(ctx.rect.x, ctx.rect.y + clickSize + barOffset, ctx.rect.width, (ctx.rect.height - 2 * clickSize) * barHeight);

            // Bar
            items.rectangle(0, 0, barRect, p => {
                p.setBackgroundColor(thumbColor);
            });
        }, mask => {
            mask.rectangle(0, 0, ctx.rect);
        });
    }

    private createBorder(ctx: RenderContext) {
        const appearance = ctx.shape;
        // Use context theme
        const isDark = ctx.designThemeMode === 'dark'; 
        const controlBorder = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        
        ctx.renderer2.rectangle(ctx.shape, 0, ctx.rect, p => {
            // Use appearance stroke if set, otherwise use theme default
            if (appearance.getAppearance(DefaultAppearance.STROKE_COLOR) != null && appearance.getAppearance(DefaultAppearance.STROKE_COLOR) !== CommonTheme.CONTROL_BORDER_COLOR) {
                p.setStrokeColor(ctx.shape);
            } else {
                p.setStrokeColor(controlBorder);
            }
        });
    }

    private createBottomTriangle(ctx: RenderContext, clickSize: number) {
        const appearance = ctx.shape;
        // Use context theme
        const isDark = ctx.designThemeMode === 'dark';
        
        // Adjust colors for dark theme
        const arrowDefault = isDark ? 0x666666 : 0xbdbdbd;
        let arrowColor = appearance.getAppearance(ARROW_COLOR);
        if (arrowColor === 0xbdbdbd && isDark) {
            arrowColor = arrowDefault;
        }
        
        const y = ctx.rect.height - 0.5 * clickSize;
        const x = ctx.rect.right * 0.5;
        const w = clickSize * 0.3;
        const h = clickSize * 0.3;

        ctx.renderer2.path(0, `M${x - 0.5 * w},${y - 0.4 * h} L${x},${y + 0.6 * h},L${x + 0.5 * w},${y - 0.4 * h} z`, p => {
            p.setBackgroundColor(arrowColor);
        });
    }

    private createTopTriangle(ctx: RenderContext, clickSize: number) {
        const appearance = ctx.shape;
        // Use context theme
        const isDark = ctx.designThemeMode === 'dark';
        
        // Adjust colors for dark theme
        const arrowDefault = isDark ? 0x666666 : 0xbdbdbd;
        let arrowColor = appearance.getAppearance(ARROW_COLOR);
        if (arrowColor === 0xbdbdbd && isDark) {
            arrowColor = arrowDefault;
        }
        
        const y = ctx.rect.top + 0.5 * clickSize;
        const x = ctx.rect.right * 0.5;
        const w = clickSize * 0.3;
        const h = clickSize * 0.3;

        ctx.renderer2.path(0, `M${x - 0.5 * w},${y + 0.4 * h} L${x},${y - 0.6 * h},L${x + 0.5 * w},${y + 0.4 * h} z`, p => {
            p.setBackgroundColor(arrowColor);
        });
    }
}
