/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConfigurableFactory, DefaultAppearance, Rect2, RenderContext, Shape, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const ACCENT_COLOR = 'ACCENT_COLOR';

const DEFAULT_APPEARANCE = {
    [ACCENT_COLOR]: 0x2171b5,
    [DefaultAppearance.BACKGROUND_COLOR]: 0xffffff,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: CommonTheme.CONTROL_TEXT_COLOR,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'left',
    [DefaultAppearance.TEXT]: 'item1\nitem2\nitem3*\nitem4',
};

export class List implements ShapePlugin {
    public identifier(): string {
        return 'List';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 120, y: 130 };
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.color(ACCENT_COLOR, 'Accent Color'),
        ];
    }

    public render(ctx: RenderContext) {
        const w = ctx.rect.width;
        const h = ctx.rect.height;

        this.createBorder(ctx);

        const parts = this.parseText(ctx.shape);

        let y = CommonTheme.CONTROL_BORDER_RADIUS;

        const itemsHeight = h - 2 * CommonTheme.CONTROL_BORDER_RADIUS;
        const itemHeight = itemsHeight / parts.length;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            const rect = new Rect2(0, y, w, itemHeight);

            if (part.selected) {
                this.createSelection(ctx, rect);
                this.createText(ctx, rect.deflate(10, 0), 0xffffff, part.text);
            } else {
                this.createText(ctx, rect.deflate(10, 0), ctx.shape, part.text);
            }

            y += itemHeight;
        }
    }

    private createSelection(ctx: RenderContext, rect: Rect2) {
        ctx.renderer2.rectangle(ctx.shape, 0, rect, p => {
            p.setBackgroundColor(ctx.shape.getAppearance(ACCENT_COLOR));
            p.setStrokeColor(ctx.shape.getAppearance(ACCENT_COLOR));
        });
    }

    private createText(ctx: RenderContext, rect: Rect2, color: any, text: string) {
        ctx.renderer2.text(ctx.shape, rect, p => {
            p.setForegroundColor(color);
            p.setText(text);
        });
    }

    private createBorder(ctx: RenderContext) {
        ctx.renderer2.rectangle(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, ctx.rect, p => {
            p.setStrokeColor(ctx.shape);
            p.setBackgroundColor(ctx.shape);
        });
    }

    private parseText(shape: Shape) {
        const key = shape.text;

        let result = shape.renderCache['PARSED'] as { key: string; parsed: Parsed[] };

        if (!result || result.key !== key) {
            const parts = key.split('\n');

            const parsed = parts.map(t => {
                const selected = t.endsWith('*');

                if (selected) {
                    return { text: t.substring(0, t.length - 1).trim(), selected };
                } else {
                    return { text: t, selected: false };
                }
            });

            result = { parsed, key };

            shape.renderCache['PARSED'] = result;
        }

        return result.parsed;
    }
}

type Parsed = { text: string; selected?: boolean };
