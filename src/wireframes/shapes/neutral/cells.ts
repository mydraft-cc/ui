/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConfigurableFactory, DefaultAppearance, Rect2, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const PADDING_HORIZONTAL = 'PADDING_HORIZONTAL2';
const PADDING_VERTICAL = 'PADDING_VERTICAL2';
const BORDER_TOP = 'BORDER_TOP';
const BORDER_DOWN = 'BORDER_DOWN';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: 0xFFFFFF,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: 0,
    [DefaultAppearance.STROKE_COLOR]: 0x000000,
    [DefaultAppearance.STROKE_THICKNESS]: 2,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'center',
    [DefaultAppearance.TEXT]: 'Cell1',
    [BORDER_TOP]: true,
    [BORDER_DOWN]: false,
    [PADDING_HORIZONTAL]: 10,
    [PADDING_VERTICAL]: 10,
};

export class Cells implements ShapePlugin {
    public identifier(): string {
        return 'Cell';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 100, y: 60 };
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.toggle(BORDER_TOP, 'Top Border'),
            factory.toggle(BORDER_DOWN, 'Bottom Border'),
            factory.number(PADDING_HORIZONTAL, 'Padding Horizontal', 0, 40),
            factory.number(PADDING_VERTICAL, 'Padding Vertical', 0, 40),
        ];
    }

    public render(ctx: RenderContext) {
        this.createFrame(ctx);
        this.createText(ctx);

        if (ctx.shape.getAppearance(BORDER_TOP)) {
            this.createBorder(ctx, 0);
        }
        if (ctx.shape.getAppearance(BORDER_DOWN)) {
            this.createBorder(ctx, 1);
        }
    }

    private createFrame(ctx: RenderContext) {
        ctx.renderer2.rectangle(ctx.shape, 0, ctx.rect, p => {
            p.setBackgroundColor(ctx.shape);
        });
    }

    private createBorder(ctx: RenderContext, index: number) {
        const strokeColor = ctx.shape.getAppearance(DefaultAppearance.STROKE_COLOR);
        const strokeWidth = ctx.shape.getAppearance(DefaultAppearance.STROKE_THICKNESS);
        const strokeHalf = strokeWidth * 0.5;
        const cellHeight = ctx.rect.h;
        const cellWidth = ctx.rect.w;
        const offset = Math.round(index * cellHeight - strokeHalf);

        const rect = new Rect2(0, offset, cellWidth, strokeWidth);

        ctx.renderer2.rectangle(0, 0, rect, p => {
            p.setBackgroundColor(strokeColor);
        });
    }

    private createText(ctx: RenderContext) {
        const paddingVertical = ctx.shape.getAppearance(PADDING_VERTICAL);
        const paddingHorizontal = ctx.shape.getAppearance(PADDING_HORIZONTAL);

        ctx.renderer2.text(ctx.shape, ctx.rect.deflate(paddingHorizontal, paddingVertical), p => {
            p.setForegroundColor(ctx.shape);
        });
    }
}
