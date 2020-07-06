/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Color, ConfigurableFactory, DefaultAppearance, Rect2, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const TAB_COLOR = 'TAB_COLOR';

const TAB_ALIGNMENT = 'TAB_ALIGNMENT';
const TAB_ALIGNMENT_LEFT = 'Left';
const TAB_ALIGNMENT_RIGHT = 'Right';

const TAB_POSITION = 'TAB_POSITION';
const TAB_POSITION_TOP = 'Top';
const TAB_POSITION_BOTTOM = 'Bottom';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.BACKGROUND_COLOR] = 0xffffff;
DEFAULT_APPEARANCE[DefaultAppearance.TEXT] = 'left,middle*,right';
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_ALIGNMENT] = 'center';
DEFAULT_APPEARANCE[DefaultAppearance.FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;
DEFAULT_APPEARANCE[TAB_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[TAB_ALIGNMENT] = TAB_ALIGNMENT_LEFT;
DEFAULT_APPEARANCE[TAB_POSITION] = TAB_POSITION_TOP;

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

        const padding = fontSize * .5;

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

        const contentItem: any = ctx.renderer.createRectangle(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, bounds);

        ctx.renderer.setBackgroundColor(contentItem, ctx.shape);
        ctx.renderer.setStrokeColor(contentItem, ctx.shape);

        ctx.add(contentItem);
    }

    private createHeader(ctx: RenderContext, parts: ParsedDefinition, heightHeader: number, isBottom: boolean) {
        const h = heightHeader;
        const y = isBottom ? ctx.rect.height - heightHeader : 0;

        const tabColor = Color.fromValue(ctx.shape.getAppearance(TAB_COLOR));

        for (const part of parts) {
            const bounds = new Rect2(part.x, y, part.width, h);

            const partItem: any = isBottom ?
                ctx.renderer.createRoundedRectangleBottom(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, bounds) :
                ctx.renderer.createRoundedRectangleTop(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, bounds);

            if (part.selected) {
                ctx.renderer.setBackgroundColor(partItem, ctx.shape);
            } else {
                ctx.renderer.setBackgroundColor(partItem, tabColor);
            }

            ctx.renderer.setStrokeColor(partItem, ctx.shape);

            const textItem = ctx.renderer.createSinglelineText(ctx.shape, bounds.deflate(4));

            ctx.renderer.setForegroundColor(textItem, ctx.shape);
            ctx.renderer.setText(textItem, part.text);

            ctx.add(partItem);
            ctx.add(textItem);
        }
    }

    private parseText(ctx: RenderContext, fontFamily: string, fontSize: number, strokeThickness: number): ParsedDefinition {
        const w = ctx.rect.width - 2 * PADDING;

        const result: ParsedDefinition = [];

        let x = 0;

        for (let text of ctx.shape.text.split(',')) {
            const selected = text.endsWith('*');

            if (selected) {
                text = text.substr(0, text.length - 1).trim();
            }

            const width = ctx.renderer.getTextWidth(text, fontSize, fontFamily) + fontSize;

            if (x + width > w) {
                break;
            }

            result.push({ text, selected, x, width });

            x += width - strokeThickness;
        }

        const isRight = ctx.shape.getAppearance(TAB_ALIGNMENT) === TAB_ALIGNMENT_RIGHT;

        let offset = PADDING;

        if (isRight) {
            const last = result[result.length - 1];

            offset += (w - (last.x + last.width));
        }

        for (const part of result) {
            part.x += offset;
        }

        return result;
    }
}

const PADDING = 20;

type ParsedDefinition = { text: string, selected?: boolean, x: number, width: number }[];
