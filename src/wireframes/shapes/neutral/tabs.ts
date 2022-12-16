/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Color, ConfigurableFactory, DefaultAppearance, Rect2, RenderContext, ShapePlugin, ShapeProperties } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const TAB_COLOR = 'TAB_COLOR';
const TAB_ALIGNMENT = 'TAB_ALIGNMENT';
const TAB_ALIGNMENT_LEFT = 'Left';
const TAB_ALIGNMENT_RIGHT = 'Right';
const TAB_POSITION = 'TAB_POSITION';
const TAB_POSITION_TOP = 'Top';
const TAB_POSITION_BOTTOM = 'Bottom';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.FOREGROUND_COLOR]: CommonTheme.CONTROL_TEXT_COLOR,
    [DefaultAppearance.BACKGROUND_COLOR]: 0xffffff,
    [DefaultAppearance.TEXT]: 'left,middle*,right',
    [DefaultAppearance.TEXT_ALIGNMENT]: 'center',
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
    [TAB_COLOR]: CommonTheme.CONTROL_BACKGROUND_COLOR,
    [TAB_ALIGNMENT]: TAB_ALIGNMENT_LEFT,
    [TAB_POSITION]: TAB_POSITION_TOP,
};

export class Tabs implements ShapePlugin {
    public identifier(): string {
        return 'Tabs';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 200, y: 150 };
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.selection(TAB_ALIGNMENT, 'Tab Alignment', [
                TAB_ALIGNMENT_LEFT,
                TAB_ALIGNMENT_RIGHT,
            ]),
            factory.selection(TAB_POSITION, 'Tab Position', [
                TAB_POSITION_TOP,
                TAB_POSITION_BOTTOM,
            ]),
            factory.color(TAB_COLOR, 'Tab Color'),
        ];
    }

    public render(ctx: RenderContext) {
        const strokeThickness = ctx.shape.strokeThickness;

        const isBottom = ctx.shape.getAppearance(TAB_POSITION) === TAB_POSITION_BOTTOM;

        const fontSize: number = ctx.shape.fontSize;
        const fontFamily: string = ctx.shape.fontFamily;

        const parts = this.parseText(ctx, fontFamily, fontSize, strokeThickness);

        const padding = fontSize * 0.5;

        const heightTotal = ctx.rect.height;
        const heightHeader = fontSize + 2 * padding;

        this.createHeader(ctx, parts, heightHeader, isBottom);

        if (heightTotal > heightHeader) {
            this.createContent(ctx, heightHeader, strokeThickness, isBottom);
        }
    }

    private createContent(ctx: RenderContext, heightHeader: number, strokeThickness: number, isBottom: boolean) {
        const w = ctx.rect.width;
        const h = ctx.rect.height - heightHeader + strokeThickness;
        const y = isBottom ? 0 : heightHeader - strokeThickness;

        const bounds = new Rect2(0, y, w, h);

        ctx.renderer2.rectangle(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, bounds, p => {
            p.setBackgroundColor(ctx.shape);
            p.setStrokeColor(ctx.shape);
        });
    }

    private createHeader(ctx: RenderContext, parts: Parsed, heightHeader: number, isBottom: boolean) {
        const h = heightHeader;
        const y = isBottom ? ctx.rect.height - heightHeader : 0;

        const tabColor = Color.fromValue(ctx.shape.getAppearance(TAB_COLOR));

        for (const part of parts) {
            const bounds = new Rect2(part.x, y, part.width, h);

            if (isBottom) {
                // Bar button
                ctx.renderer2.roundedRectangleBottom(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, bounds, p => {
                    this.stylePart(part, ctx, tabColor, p);
                });
            } else {
                // Bar button
                ctx.renderer2.roundedRectangleTop(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, bounds, p => {
                    this.stylePart(part, ctx, tabColor, p);
                });
            }

            // Bar button text.
            ctx.renderer2.text(ctx.shape, bounds.deflate(4), p => {
                p.setForegroundColor(ctx.shape);
                p.setText(part.text);
            });
        }
    }

    private stylePart(part: { text: string; selected?: boolean }, ctx: RenderContext, tabColor: Color, p: ShapeProperties) {
        if (part.selected) {
            p.setBackgroundColor(ctx.shape);
        } else {
            p.setBackgroundColor(tabColor);
        }

        p.setStrokeColor(ctx.shape);
    }

    private parseText(ctx: RenderContext, fontFamily: string, fontSize: number, strokeThickness: number) {
        const key = `${ctx.shape.text}_${fontFamily}_${fontSize}_${strokeThickness}`;

        let result = ctx.shape.renderCache['PARSED'] as { key: string; parsed: Parsed };

        if (!result || result.key !== key) {
            const w = ctx.rect.width - 2 * PADDING;

            const parsed: Parsed = [];

            let x = 0;

            for (let text of ctx.shape.text.split(',')) {
                const selected = text.endsWith('*');

                if (selected) {
                    text = text.substring(0, text.length - 1).trim();
                }

                const width = ctx.renderer2.getTextWidth(text, fontSize, fontFamily) + fontSize;

                if (x + width > w) {
                    break;
                }

                parsed.push({ text, selected, x, width });

                x += width - strokeThickness;
            }

            const isRight = ctx.shape.getAppearance(TAB_ALIGNMENT) === TAB_ALIGNMENT_RIGHT;

            let offset = PADDING;

            if (isRight) {
                const last = parsed[parsed.length - 1];

                offset += (w - (last.x + last.width));
            }

            for (const part of parsed) {
                part.x += offset;
            }

            result = { parsed, key };

            ctx.shape.renderCache['PARSED'] = result;
        }

        return result.parsed;
    }
}

const PADDING = 20;

type Parsed = { text: string; selected?: boolean; x: number; width: number }[];
