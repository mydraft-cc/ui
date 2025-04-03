/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, RenderContext, ShapePlugin, ShapeSource } from '@app/wireframes/interface';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.FOREGROUND_COLOR]: 0,
    [DefaultAppearance.TEXT_DISABLED]: true,
};

export class Icon implements ShapePlugin {
    public identifier(): string {
        return 'Icon';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 40, y: 40 };
    }

    public create(source: ShapeSource) {
        if (source.type == 'Icon') {
            const { text, fontFamily } = source;

            return {
                renderer: this.identifier(),
                appearance: { 
                    [DefaultAppearance.TEXT]: text, 
                    [DefaultAppearance.ICON_FONT_FAMILY]: fontFamily,
                },
            };
        }

        return null;
    }

    public showInGallery() {
        return false;
    }

    public render(ctx: RenderContext) {
        const fontSize = Math.min(ctx.rect.w, ctx.rect.h) - 10;
        const config = { fontSize, text: ctx.shape.text, alignment: 'center' };
        const isDark = ctx.designThemeMode === 'dark';
        const foregroundColor = ctx.shape.getAppearance(DefaultAppearance.FOREGROUND_COLOR);

        ctx.renderer2.text(config, ctx.rect, p => {
            // If the color hasn't been customized by the user (still at 0)
            if (foregroundColor === 0) {
                if (isDark) {
                    p.setForegroundColor(0xe0e0e0);
                    p.setOpacity(0.85);
                } else {
                    p.setForegroundColor(0x373a3c);
                    p.setOpacity(0.88);
                }
            } else {
                // User has customized the color
                p.setForegroundColor(ctx.shape);
            }
            
            p.setFontFamily(ctx.shape.getAppearance(DefaultAppearance.ICON_FONT_FAMILY) || 'FontAwesome');
        });
    }
}
