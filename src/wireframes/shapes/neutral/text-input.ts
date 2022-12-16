/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: 0xFFFFFF,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: CommonTheme.CONTROL_TEXT_COLOR,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'left',
    [DefaultAppearance.TEXT]: 'TextInput',
};

export class TextInput implements ShapePlugin {
    public identifier(): string {
        return 'TextInput';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 100, y: 30 };
    }

    public render(ctx: RenderContext) {
        this.createBorder(ctx);
        this.createText(ctx);
    }

    private createBorder(ctx: RenderContext) {
        ctx.renderer2.rectangle(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, ctx.rect, p => {
            p.setBackgroundColor(ctx.shape);
            p.setStrokeColor(ctx.shape);
        });
    }

    private createText(ctx: RenderContext) {
        ctx.renderer2.text(ctx.shape, ctx.rect.deflate(14, 4), p => {
            p.setForegroundColor(ctx.shape);
        });
    }
}
