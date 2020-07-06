/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, Rect2, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.BACKGROUND_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.TEXT] = '43';
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_ALIGNMENT] = 'left';
DEFAULT_APPEARANCE[DefaultAppearance.FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;

export class Numeric implements ShapePlugin {
    public identifier(): string {
        return 'Numeric';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 80, y: 40 };
    }

    public render(ctx: RenderContext) {
        const clickSize = Math.min(40, Math.min(0.8 * ctx.rect.width, ctx.rect.height));

        this.createInputArea(ctx, clickSize);
        this.createText(ctx, clickSize);
        this.createClickArea(ctx, clickSize);
        this.createIncrementer(ctx, clickSize);
        this.createDecrementer(ctx, clickSize);
    }

    private createClickArea(ctx: RenderContext, clickSize: number) {
        const clickAreaRect = new Rect2(ctx.rect.right - clickSize, 0, clickSize, ctx.rect.height);
        const clickAreaItem = ctx.renderer.createRoundedRectangleRight(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, clickAreaRect);

        ctx.renderer.setStrokeColor(clickAreaItem, ctx.shape);
        ctx.renderer.setBackgroundColor(clickAreaItem, ctx.shape);

        ctx.add(clickAreaItem);
    }

    private createIncrementer(ctx: RenderContext, clickSize: number) {
        const y = ctx.rect.height * 0.35;
        const x = ctx.rect.right - 0.5 * clickSize;
        const w = clickSize * 0.3;
        const h = clickSize * 0.2;

        const incrementerItem = ctx.renderer.createPath(0, `M${x - 0.5 * w},${y} L${x},${y - h},L${x + 0.5 * w},${y} z`);

        ctx.renderer.setBackgroundColor(incrementerItem, ctx.shape.strokeColor);

        ctx.add(incrementerItem);
    }

    private createDecrementer(ctx: RenderContext, clickSize: number) {
        const y = ctx.rect.height * 0.65;
        const x = ctx.rect.right - 0.5 * clickSize;
        const w = clickSize * 0.3;
        const h = clickSize * 0.2;

        const decrementerItem = ctx.renderer.createPath(0, `M${x - 0.5 * w},${y} L${x},${y + h},L${x + 0.5 * w},${y} z`);

        ctx.renderer.setBackgroundColor(decrementerItem, ctx.shape.strokeColor);

        ctx.add(decrementerItem);
    }

    private createInputArea(ctx: RenderContext, clickSize: number) {
        const inputAreaRect = new Rect2(0, 0, ctx.rect.width - clickSize + 1, ctx.rect.height);
        const inputAreaItem = ctx.renderer.createRoundedRectangleLeft(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, inputAreaRect);

        ctx.renderer.setStrokeColor(inputAreaItem, ctx.shape);
        ctx.renderer.setBackgroundColor(inputAreaItem, 0xffffff);

        ctx.add(inputAreaItem);
    }

    private createText(ctx: RenderContext, clickSize: number) {
        const textRect =
            new Rect2(14, 4,
                Math.max(0, ctx.rect.width - clickSize - 6),
                Math.max(0, ctx.rect.height - 8));
        const textItem = ctx.renderer.createSinglelineText(ctx.shape, textRect);

        ctx.renderer.setForegroundColor(textItem, ctx.shape);

        ctx.add(textItem);
    }
}
