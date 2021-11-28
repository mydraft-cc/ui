/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.TEXT] = 'Lorem ipsum dolor sit amet, alii rebum postea eam ex. Et mei laoreet officiis, summo sensibus id mei.';
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_ALIGNMENT] = 'left';
DEFAULT_APPEARANCE[DefaultAppearance.FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_THICKNESS] = 1;

export class Comment implements ShapePlugin {
    public identifier(): string {
        return 'Comment';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 170, y: 150 };
    }

    public render(ctx: RenderContext) {
        const corner = Math.min(14.5, ctx.rect.width, ctx.rect.height) - 0.5;

        this.createBorder(ctx, corner);
        this.createText(ctx);
    }

    private createBorder(ctx: RenderContext, c: number) {
        const l = ctx.rect.left;
        const r = ctx.rect.right;
        const t = ctx.rect.top;
        const b = ctx.rect.bottom;

        const borderItem = ctx.renderer.createPath(ctx.shape, `M${l + c},${t} L${r},${t} L${r},${b} L${l},${b} L${l},${t + c} L${l + c},${t} L${l + c},${t + c} L${l},${t + c} z`, ctx.rect);

        ctx.renderer.setBackgroundColor(borderItem, 0xfff9b7);
        ctx.renderer.setStrokeColor(borderItem, 0);
        ctx.renderer.setStrokeStyle(borderItem, 'round', 'round');

        ctx.add(borderItem);
    }

    private createText(ctx: RenderContext) {
        const textItem = ctx.renderer.createMultilineText(ctx.shape, ctx.rect.deflate(10, 20));

        ctx.add(textItem);
    }
}
