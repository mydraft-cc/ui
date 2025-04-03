/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConfigurableFactory, DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';
import { SHAPE_BACKGROUND_COLOR } from './ThemeShapeUtils';

const IMAGE_URL = 'URL';
const IMAGE_ASPECT_RATIO = 'ASPECT_RATIO';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: 0xFFFFFF,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
    [DefaultAppearance.TEXT_DISABLED]: true,
    [IMAGE_ASPECT_RATIO]: true,
    [IMAGE_URL]: '',
};

export class Image implements ShapePlugin {
    public identifier(): string {
        return 'Image';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 100, y: 100 };
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.text(IMAGE_URL, 'Url'),
            factory.toggle(IMAGE_ASPECT_RATIO, 'Preserve aspect ratio'),
        ];
    }

    public render(ctx: RenderContext) {
        const url = ctx.shape.getAppearance(IMAGE_URL);

        if (url) {
            const aspectRatio = ctx.shape.getAppearance(IMAGE_ASPECT_RATIO);

            ctx.renderer2.raster(url, ctx.rect, aspectRatio);
        } else {
            this.createBorder(ctx);
            this.createCross(ctx);
        }
    }

    private createCross(ctx: RenderContext) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        const controlBorder = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        const l = ctx.rect.left + 0.5;
        const r = ctx.rect.right - 0.5;
        const t = ctx.rect.top + 0.5;
        const b = ctx.rect.bottom - 0.5;

        const path = `M${l},${t} L${r},${b} M${l},${b} L${r},${t}`;

        ctx.renderer2.path(ctx.shape, path, p => {
            if (appearance.getAppearance(DefaultAppearance.STROKE_COLOR) === CommonTheme.CONTROL_BORDER_COLOR) {
                p.setStrokeColor(controlBorder);
            } else {
                p.setStrokeColor(ctx.shape);
            }
            p.setStrokeStyle('butt', 'butt');
        });
    }

    private createBorder(ctx: RenderContext) {
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        const bgColor = isDark ? SHAPE_BACKGROUND_COLOR.DARK : 0xFFFFFF;
        const controlBorder = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;
        
        ctx.renderer2.rectangle(ctx.shape, 0, ctx.rect, p => {
            if (appearance.getAppearance(DefaultAppearance.BACKGROUND_COLOR) === 0xFFFFFF) {
                p.setBackgroundColor(bgColor);
            } else {
                p.setBackgroundColor(ctx.shape);
            }
            
            if (appearance.getAppearance(DefaultAppearance.STROKE_COLOR) === CommonTheme.CONTROL_BORDER_COLOR) {
                p.setStrokeColor(controlBorder);
            } else {
                p.setStrokeColor(ctx.shape);
            }
        });
    }
}
