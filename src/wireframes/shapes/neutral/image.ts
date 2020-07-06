/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.BACKGROUND_COLOR] = 0xFFFFFF;
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_DISABLED] = true;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;

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

    public render(ctx: RenderContext) {
        this.createBorder(ctx);
        this.createCross(ctx);
    }

    private createCross(ctx: RenderContext) {
        const l = ctx.rect.left + 0.5;
        const r = ctx.rect.right - 0.5;
        const t = ctx.rect.top + 0.5;
        const b = ctx.rect.bottom - 0.5;

        const crossItem = ctx.renderer.createPath(ctx.shape, `M${l},${t} L${r},${b} M${l},${b} L${r},${t}`);

        ctx.renderer.setStrokeColor(crossItem, ctx.shape);
        ctx.renderer.setStrokeStyle(crossItem, 'butt', 'butt');

        ctx.add(crossItem);
    }

    private createBorder(ctx: RenderContext) {
        const borderItem = ctx.renderer.createRectangle(ctx.shape, 0, ctx.rect);

        ctx.renderer.setBackgroundColor(borderItem, ctx.shape);
        ctx.renderer.setStrokeColor(borderItem, ctx.shape);

        ctx.add(borderItem);
    }
}
