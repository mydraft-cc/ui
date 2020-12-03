/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Color, ConfigurableFactory, DefaultAppearance, Rect2, RenderContext, Shape, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const ACCENT_COLOR = 'ACCENT_COLOR';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.BACKGROUND_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.TEXT] = 'left,middle*,right';
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_ALIGNMENT] = 'center';
DEFAULT_APPEARANCE[DefaultAppearance.FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;
DEFAULT_APPEARANCE[ACCENT_COLOR] = 0x2171b5;

export class ButtonBar implements ShapePlugin {
    public identifier(): string {
        return 'ButtonBar';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 180, y: 30 };
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.color(ACCENT_COLOR, 'Accent Color'),
        ];
    }

    public render(ctx: RenderContext) {
        const w = ctx.rect.width;
        const h = ctx.rect.height;

        const parts = this.parseText(ctx.shape);

        const itemWidth = Math.round(w / parts.length);
        const itemHeight = h;

        const accentColor = Color.fromValue(ctx.shape.getAppearance(ACCENT_COLOR));

        let x = 0;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            const isLast = i === parts.length - 1;
            const isFirst = i === 0;

            const width = isLast ? (w - x) : itemWidth;

            const bounds = new Rect2(x, 0, width, itemHeight);

            let partItem: any;

            if (parts.length === 1) {
                partItem = ctx.renderer.createRectangle(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, bounds);
            } else if (isFirst) {
                partItem = ctx.renderer.createRoundedRectangleLeft(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, bounds);
            } else if (isLast) {
                partItem = ctx.renderer.createRoundedRectangleRight(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, bounds);
            } else {
                partItem = ctx.renderer.createRectangle(ctx.shape, 0, bounds);
            }

            if (part.selected) {
                ctx.renderer.setBackgroundColor(partItem, accentColor);
                ctx.renderer.setStrokeColor(partItem, accentColor);
            } else {
                ctx.renderer.setBackgroundColor(partItem, ctx.shape);
                ctx.renderer.setStrokeColor(partItem, ctx.shape);
            }

            const textItem = ctx.renderer.createSinglelineText(ctx.shape, bounds.deflate(4));

            if (part.selected) {
                if (accentColor.luminance > 0.4) {
                    ctx.renderer.setForegroundColor(textItem, 0);
                } else {
                    ctx.renderer.setForegroundColor(textItem, 0xffffff);
                }
            } else {
                ctx.renderer.setForegroundColor(textItem, ctx.shape);
            }

            ctx.renderer.setText(textItem, part.text);

            ctx.add(partItem);
            ctx.add(textItem);

            x += itemWidth;
        }
    }

    private parseText(shape: Shape) {
        const parts = shape.text.split(',');

        return parts.map(t => {
            const selected = t.endsWith('*');

            if (selected) {
                return { text: t.substr(0, t.length - 1).trim(), selected };
            } else {
                return { text: t, selected: false };
            }
        });
    }
}
