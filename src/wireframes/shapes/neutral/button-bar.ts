/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Color, ConfigurableFactory, DefaultAppearance, Rect2, RenderContext, Shape, ShapePlugin, ShapeProperties } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const ACCENT_COLOR = 'ACCENT_COLOR';

const DEFAULT_APPEARANCE = {
    [ACCENT_COLOR]: 0x2171b5,
    [DefaultAppearance.BACKGROUND_COLOR]: CommonTheme.CONTROL_BACKGROUND_COLOR,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: CommonTheme.CONTROL_TEXT_COLOR,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'center',
    [DefaultAppearance.TEXT]: 'left,middle*,right',
};

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

        const itemWidth = Math.floor(w / parts.length);
        const itemHeight = h;

        const accentColor = Color.fromValue(ctx.shape.getAppearance(ACCENT_COLOR));

        const renderButtons = (selected: boolean) => {
            let x = 0;

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];

                if (part.selected === selected) {
                    const isLast = i === parts.length - 1;
                    const isFirst = i === 0;

                    const width = isLast ? (w - x) : itemWidth;

                    const bounds = new Rect2(x, 0, width, itemHeight);

                    if (parts.length === 1) {
                        ctx.renderer2.rectangle(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, bounds, p => {
                            this.stylePart(part, ctx, accentColor, p);
                        });
                    } else if (isFirst) {
                        ctx.renderer2.roundedRectangleLeft(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, bounds, p => {
                            this.stylePart(part, ctx, accentColor, p);
                        });
                    } else if (isLast) {
                        ctx.renderer2.roundedRectangleRight(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, bounds, p => {
                            this.stylePart(part, ctx, accentColor, p);
                        });
                    } else {
                        ctx.renderer2.rectangle(ctx.shape, 0, bounds, p => {
                            this.stylePart(part, ctx, accentColor, p);
                        });
                    }

                    // Button text.
                    ctx.renderer2.text(ctx.shape, bounds.deflate(4), p => {
                        if (part.selected) {
                            if (accentColor.luminance > 0.4) {
                                p.setForegroundColor(0);
                            } else {
                                p.setForegroundColor(0xffffff);
                            }
                        } else {
                            p.setForegroundColor(ctx.shape);
                        }

                        p.setText(part.text);
                    });
                }

                x += itemWidth;
            }
        };

        renderButtons(false);
        renderButtons(true);
    }

    private stylePart(part: Parsed, ctx: RenderContext, accentColor: Color, p: ShapeProperties) {
        if (part.selected) {
            p.setBackgroundColor(accentColor);
            p.setStrokeColor(accentColor);
        } else {
            p.setBackgroundColor(ctx.shape);
            p.setStrokeColor(ctx.shape);
        }
    }

    private parseText(shape: Shape) {
        const key = shape.text;

        let result = shape.renderCache['PARSED'] as { key: string; parsed: Parsed[] };

        if (!result || result.key !== key) {
            const parts = key.split(',');

            const parsed = parts.map(text => {
                const selected = text.endsWith('*');

                if (selected) {
                    return { text: text.substring(0, text.length - 1).trim(), selected };
                } else {
                    return { text, selected };
                }
            });

            result = { parsed, key };

            shape.renderCache['PARSED'] = result;
        }

        return result.parsed;
    }
}

type Parsed = { text: string; selected?: boolean };
