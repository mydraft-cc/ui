/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, Rect2, RenderContext, ShapePlugin } from '@app/wireframes/interface';
// import { RendererService } from '@app/wireframes/model/renderer.service';
// import { AbstractControl } from '../utils/abstract-control';
import { CommonTheme } from './_theme';

const CELL_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: 0xFFFFFF,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: 0,
    [DefaultAppearance.STROKE_COLOR]: 0x000000,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'center',
    [DefaultAppearance.TEXT]: 'Cell',
    [DefaultAppearance.BORDER_TOP]: 2,
    [DefaultAppearance.BORDER_DOWN]: 2,
};

export class Cell implements ShapePlugin {
    factorWidth = 1;

    public identifier(): string {
        return 'Cell';
    }

    public defaultAppearance() {
        return CELL_APPEARANCE;
    }

    public defaultSize() {
        return { x: 100, y: 40 };
    }

    public render(ctx: RenderContext) {

        this.createFrame(ctx);
        this.createText(ctx);
        this.createBorder(ctx);
    }

    private createFrame(ctx: RenderContext) {
        const rect = new Rect2(0, 0, ctx.rect.width * this.factorWidth, ctx.rect.height);

        ctx.renderer2.rectangle(ctx.shape, 0, rect, p => {
            p.setBackgroundColor(ctx.shape);
        });
    }

    private createBorder(ctx: RenderContext) {
        const strokeColor = ctx.shape.getAppearance(DefaultAppearance.STROKE_COLOR);
        const strokeTop = CommonTheme.CONTROL_BORDER_THICKNESS * ctx.shape.getAppearance(DefaultAppearance.BORDER_TOP);
        const strokeBot = CommonTheme.CONTROL_BORDER_THICKNESS * ctx.shape.getAppearance(DefaultAppearance.BORDER_DOWN);

        const offset = Math.round(ctx.rect.height - strokeTop * 0.25 - strokeBot * 0.25);

        // Top
        const rectX = new Rect2(0, 0, ctx.rect.width, strokeTop);
        ctx.renderer2.rectangle(0, 0, rectX, p => {
            p.setBackgroundColor(strokeColor);
        });

        // Bottom
        const rectY = new Rect2(0, offset, ctx.rect.width * this.factorWidth, strokeBot);
        ctx.renderer2.rectangle(0, 0, rectY, p => {
            p.setBackgroundColor(strokeColor);
        });
    }

    private createText(ctx: RenderContext) {
        const rect = new Rect2(0, 0, ctx.rect.width * this.factorWidth, ctx.rect.height);

        ctx.renderer2.text(ctx.shape, rect, p => {
            p.setForegroundColor(ctx.shape);
        });
    }
}