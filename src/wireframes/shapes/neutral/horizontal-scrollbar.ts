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

export class HorizontalScrollbar implements ShapePlugin {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'HorizontalScrollbar';
    }

    public defaultSize() {
        return { x: 300, y: 20 };
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
        const clickSize = Math.min(30, Math.min(0.8 * ctx.rect.width, ctx.rect.height));

        this.createBackground(ctx, clickSize);
        this.createBorder(ctx);
        this.createRightTriangle(ctx, clickSize);
        this.createLeftTriangle(ctx, clickSize);
    }

    private createBackground(ctx: RenderContext, clickSize: number) {
        const appearance = ctx.shape;
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
                if (appearance.getAppearance(DefaultAppearance.BACKGROUND_COLOR) === CommonTheme.CONTROL_BACKGROUND_COLOR) {
                    p.setBackgroundColor(controlBg);
                } else {
                    p.setBackgroundColor(ctx.shape);
                }
            });

            const barWidth = ctx.shape.getAppearance(THUMB_SIZE) / 100;
            const barOffset = ctx.shape.getAppearance(THUMB_POSITION) / 100 * (ctx.rect.width - 2 * clickSize) * (1 - barWidth);
            
            const barRect = new Rect2(ctx.rect.x + clickSize + barOffset, ctx.rect.y, (ctx.rect.width - 2 * clickSize) * barWidth, ctx.rect.height);

            // Bar
            items.rectangle(0, 0, barRect, p => {
                p.setBackgroundColor(thumbColor);
            });
        }, clip => {
            clip.rectangle(0, 0, ctx.rect);
        });
    }

    private createBorder(ctx: RenderContext) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        const controlBg = isDark ? 0x333333 : CommonTheme.CONTROL_BACKGROUND_COLOR;
        
        ctx.renderer2.rectangle(ctx.shape, 0, ctx.rect, p => {
            if (appearance.getAppearance(DefaultAppearance.STROKE_COLOR) === CommonTheme.CONTROL_BACKGROUND_COLOR) {
                p.setStrokeColor(controlBg);
            } else {
                p.setStrokeColor(ctx.shape);
            }
        });
    }

    private createRightTriangle(ctx: RenderContext, clickSize: number) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        
        // Adjust colors for dark theme
        const arrowDefault = isDark ? 0x666666 : 0xbdbdbd;
        let arrowColor = appearance.getAppearance(ARROW_COLOR);
        if (arrowColor === 0xbdbdbd && isDark) {
            arrowColor = arrowDefault;
        }
        
        const y = ctx.rect.height * 0.5;
        const x = ctx.rect.right - 0.5 * clickSize;
        const w = clickSize * 0.3;
        const h = clickSize * 0.3;

        const path = `M${x - 0.4 * w},${y - 0.5 * h} L${x + 0.6 * w},${y},L${x - 0.4 * w},${y + 0.5 * h} z`;

        ctx.renderer2.path(0, path, p => {
            p.setBackgroundColor(arrowColor);
        });
    }

    private createLeftTriangle(ctx: RenderContext, clickSize: number) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        
        // Adjust colors for dark theme
        const arrowDefault = isDark ? 0x666666 : 0xbdbdbd;
        let arrowColor = appearance.getAppearance(ARROW_COLOR);
        if (arrowColor === 0xbdbdbd && isDark) {
            arrowColor = arrowDefault;
        }
        
        const y = ctx.rect.height * 0.5;
        const x = ctx.rect.left + 0.5 * clickSize;
        const w = clickSize * 0.3;
        const h = clickSize * 0.3;

        const path = `M${x + 0.4 * w},${y - 0.5 * h} L${x - 0.6 * w},${y},L${x + 0.4 * w},${y + 0.5 * h} z`;

        ctx.renderer2.path(0, path, p => {
            p.setBackgroundColor(arrowColor);
        });
    }
}
