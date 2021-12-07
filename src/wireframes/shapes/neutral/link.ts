/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConstraintFactory, DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.FOREGROUND_COLOR] = 0x08519c;
DEFAULT_APPEARANCE[DefaultAppearance.BACKGROUND_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.TEXT] = 'Link';
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_ALIGNMENT] = 'center';
DEFAULT_APPEARANCE[DefaultAppearance.FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;

export class Link implements ShapePlugin {
    public identifier(): string {
        return 'Link';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 40, y: 30 };
    }

    public constraint(factory: ConstraintFactory) {
        return factory.textSize(5);
    }

    public render(ctx: RenderContext) {
        ctx.renderer2.text(ctx.shape, ctx.rect, p => {
            p.setForegroundColor(ctx.shape);
        });

        const fontSize = ctx.shape.fontSize;

        const width = ctx.renderer2.getTextWidth(ctx.shape.text, fontSize, 'inherit');

        const w = Math.floor(Math.min(width, ctx.rect.width));
        const x = Math.floor((ctx.rect.width - w) * 0.5);
        const y = Math.floor((ctx.rect.cy + fontSize * 0.5)) + (ctx.shape.strokeThickness % 2 === 1 ? 0.5 : 0);

        const path = `M${x},${y} L${x + w},${y}`;

        ctx.renderer2.path(ctx.shape, path, undefined, p => {
            p.setStrokeColor(ctx.shape.foregroundColor);
        });
    }
}
