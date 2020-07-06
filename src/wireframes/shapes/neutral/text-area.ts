/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.BACKGROUND_COLOR] = 0xFFFFFF;
DEFAULT_APPEARANCE[DefaultAppearance.TEXT] = 'TextArea';
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_ALIGNMENT] = 'left';
DEFAULT_APPEARANCE[DefaultAppearance.FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;

export class TextArea implements ShapePlugin {
    public identifier(): string {
        return 'TextArea';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 160, y: 60 };
    }

    public render(ctx: RenderContext) {
        this.createBorder(ctx);
        this.createText(ctx);
    }

    private createBorder(ctx: RenderContext) {
        const borderItem = ctx.renderer.createRectangle(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, ctx.rect);

        ctx.renderer.setBackgroundColor(borderItem, ctx.shape);
        ctx.renderer.setStrokeColor(borderItem, ctx.shape);

        ctx.add(borderItem);
    }

    private createText(ctx: RenderContext) {
        const textItem = ctx.renderer.createMultilineText(ctx.shape, ctx.rect.deflate(14, 4));

        ctx.renderer.setForegroundColor(textItem, ctx.shape);

        ctx.add(textItem);
    }
}
