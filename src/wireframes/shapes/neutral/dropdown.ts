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
DEFAULT_APPEARANCE[DefaultAppearance.TEXT] = 'Dropdown';
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_ALIGNMENT] = 'left';
DEFAULT_APPEARANCE[DefaultAppearance.FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;

export class Dropdown implements ShapePlugin {
    public identifier(): string {
        return 'Dropdown';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 120, y: 30 };
    }

    public render(ctx: RenderContext) {
        const clickArea = Math.min(40, Math.min(0.8 * ctx.rect.width, ctx.rect.height));

        this.createBorder(ctx);
        this.createText(ctx, clickArea);
        this.createClickTriangle(ctx, clickArea);
    }

    private createClickTriangle(ctx: RenderContext, clickSize: number) {
        const y = ctx.rect.height * 0.5;
        const x = ctx.rect.right - 0.5 * clickSize;
        const w = clickSize * 0.3;
        const h = clickSize * 0.2;

        const triangleItem = ctx.renderer.createPath(0, `M${x - 0.5 * w},${y - 0.4 * h} L${x},${y + 0.6 * h},L${x + 0.5 * w},${y - 0.4 * h} z`);

        ctx.renderer.setBackgroundColor(triangleItem, ctx.shape.strokeColor);

        ctx.add(triangleItem);
    }

    private createBorder(ctx: RenderContext) {
        const borderItem = ctx.renderer.createRectangle(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, ctx.rect);

        ctx.renderer.setBackgroundColor(borderItem, ctx.shape);
        ctx.renderer.setStrokeColor(borderItem, ctx.shape);

        ctx.add(borderItem);
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
