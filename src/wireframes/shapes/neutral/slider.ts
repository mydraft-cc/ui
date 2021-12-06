/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConfigurableFactory, ConstraintFactory, DefaultAppearance, Rect2, RenderContext, ShapePlugin, Vec2 } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const ACCENT_COLOR = 'ACCENT_COLOR';

const VALUE = 'VALUE';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.FOREGROUND_COLOR] = 0xffffff;
DEFAULT_APPEARANCE[DefaultAppearance.BACKGROUND_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_DISABLED] = true;
DEFAULT_APPEARANCE[ACCENT_COLOR] = 0x2171b5;
DEFAULT_APPEARANCE[VALUE] = 50;

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
            factory.slider(VALUE, 'Value', 0, 100),
            factory.color(ACCENT_COLOR, 'Accent Color'),
        ];
    }

    public render(ctx: RenderContext) {
        const sliderRect = new Rect2(HEIGHT_TOTAL * 0.5, (HEIGHT_TOTAL - HEIGHT_BORDER) * 0.5, ctx.rect.width - HEIGHT_TOTAL, HEIGHT_BORDER);

        const relative = ctx.shape.getAppearance(VALUE) / 100;

        this.createBackground(ctx, sliderRect, relative);
        this.createBorder(ctx, sliderRect);
        this.createThumb(ctx, relative);
    }

    private createThumb(ctx: RenderContext, relative: number) {
        const thumbCenter = new Vec2(ctx.rect.x + ctx.rect.width * relative, 0.5 * HEIGHT_TOTAL);

        ctx.renderer2.ellipse(ctx.shape, Rect2.fromCenter(thumbCenter, 0.5 * HEIGHT_TOTAL), p => {
            p.setStrokeColor(ctx.shape);
            p.setBackgroundColor(ctx.shape.foregroundColor);
        });
    }

    private createBackground(ctx: RenderContext, bounds: Rect2, relative: number) {
        ctx.renderer2.group(items => {
            const activeRect = new Rect2(bounds.x, bounds.y, bounds.width * relative, bounds.height);

            // Active item.
            items.rectangle(0, 0, activeRect, p => {
                p.setBackgroundColor(ctx.shape.getAppearance(ACCENT_COLOR));
            });

            const inactiveRect = new Rect2(bounds.x + bounds.width * relative, bounds.top, bounds.width * (1 - relative), bounds.height);

            // Inactive item
            ctx.renderer2.rectangle(0, 0, inactiveRect, p => {
                p.setBackgroundColor(ctx.shape);
            });
        }, clip => {
            clip.rectangle(0, bounds.height * 0.5, bounds);
        });
    }

    private createBorder(ctx: RenderContext, bounds: Rect2) {
        ctx.renderer2.rectangle(ctx.shape, bounds.height * 0.5, bounds, p => {
            p.setStrokeColor(ctx.shape);
        });
    }
}
