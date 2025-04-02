/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rect2 } from '@app/core';
import { DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';
import { DiagramItem } from '@app/wireframes/model';

const OFFSET = { left: 4, top: 70, right: 4, bottom: 15 };
const REFRESH_CODE = String.fromCharCode(0xf021);

export class Browser implements ShapePlugin {
    public identifier(): string {
        return 'Browser';
    }

    public defaultAppearance() {
        return { 
            [DefaultAppearance.BACKGROUND_COLOR]: 0xFFFFFF,
            [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
            [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
        };
    }

    public defaultSize() {
        return { x: 600, y: 400 };
    }

    public render(ctx: RenderContext) {
        this.createWindow(ctx);

        if (ctx.rect.width >= 50 && ctx.rect.height > 200) {
            this.createInner(ctx);
            this.createSearch(ctx);
            this.createButtons(ctx);
            this.createIcon(ctx);
        }
    }

    private createWindow(ctx: RenderContext) {
        const isDark = ctx.designThemeMode === 'dark'; 
        const controlBg = isDark ? 0x404040 : CommonTheme.CONTROL_BACKGROUND_COLOR;
        const controlBorder = isDark ? 0x555555 : CommonTheme.CONTROL_BORDER_COLOR;
        const windowRect = new Rect2(-OFFSET.left, -OFFSET.top, ctx.rect.width + OFFSET.left + OFFSET.right, ctx.rect.height + OFFSET.top + OFFSET.bottom);

        ctx.renderer2.rectangle(1, 0, windowRect, p => {
            p.setBackgroundColor(controlBg);
            p.setStrokeColor(controlBorder);
        });
    }

    private createInner(ctx: RenderContext) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        const darkBgColor = 0x2A2A2A;  // Default dark background
        const lightBgColor = 0xFFFFFF; // Default light background

        ctx.renderer2.rectangle(0, 0, ctx.rect, p => {
            let finalBgColor: number | string | DiagramItem = lightBgColor; // Start with light default

            if (isDark) {
                // If theme is dark, always use the dark background for the inner area
                finalBgColor = darkBgColor;
            } else {
                // If theme is light, check if user explicitly set a different background
                const explicitColor = appearance.getAppearance(DefaultAppearance.BACKGROUND_COLOR);
                if (explicitColor != null && explicitColor !== lightBgColor) {
                    // Use the explicitly set color (likely from user properties)
                    finalBgColor = ctx.shape.getAppearance(DefaultAppearance.BACKGROUND_COLOR);
                } else {
                    // Use the default light background
                    finalBgColor = lightBgColor;
                }
            }
            
            p.setBackgroundColor(finalBgColor);
        });
    }

    private createSearch(ctx: RenderContext) {
        const isDark = ctx.designThemeMode === 'dark';
        const controlBorder = isDark ? 0x555555 : CommonTheme.CONTROL_BORDER_COLOR;
        const searchBg = isDark ? 0x505050 : 0xffffff;
        const searchRect = new Rect2(50, -34, ctx.rect.width - 50, 30);

        ctx.renderer2.rectangle(1, 15, searchRect, p => {
            p.setBackgroundColor(searchBg);
            p.setStrokeColor(controlBorder);
        });
    }

    private createIcon(ctx: RenderContext) {
        const isDark = ctx.designThemeMode === 'dark';
        const iconColor = isDark ? 0xaaaaaa : 0x555555;
        const iconRect = new Rect2(5, -34, 30, 30);

        ctx.renderer2.text({ fontSize: 20, text: REFRESH_CODE, alignment: 'center' }, iconRect, p => {
            p.setForegroundColor(iconColor);
            p.setFontFamily('FontAwesome');
        });
    }

    private createButtons(ctx: RenderContext) {
        ctx.renderer2.ellipse(0, new Rect2(10, -50, 12, 12), p => {
            p.setBackgroundColor(0xff0000);
        });

        ctx.renderer2.ellipse(0, new Rect2(30, -50, 12, 12), p => {
            p.setBackgroundColor(0xffff00);
        });

        ctx.renderer2.ellipse(0, new Rect2(50, -50, 12, 12), p => {
            p.setBackgroundColor(0x00ff00);
        });
    }
}
