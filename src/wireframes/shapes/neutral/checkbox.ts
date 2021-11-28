/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConfigurableFactory, ConstraintFactory, DefaultAppearance, Rect2, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const STATE_KEY = 'STATE';
const STATE_NORMAL = 'Normal';
const STATE_CHECKED = 'Checked';
const STATE_INTERDEMINATE = 'Interdeminate';
const BOX_SIZE = 18;
const BOX_MARGIN = 4;
const TEXT_POSITION_X = BOX_SIZE + 2 * BOX_MARGIN;

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.BACKGROUND_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.TEXT] = 'Checkbox';
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_ALIGNMENT] = 'left';
DEFAULT_APPEARANCE[DefaultAppearance.FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;
DEFAULT_APPEARANCE[STATE_KEY] = STATE_NORMAL;

export class Checkbox implements ShapePlugin {
    public identifier(): string {
        return 'Checkbox';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 104, y: 36 };
    }

    public constraint(factory: ConstraintFactory) {
        return factory.textHeight(8);
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.selection(STATE_KEY, 'State', [
                STATE_NORMAL,
                STATE_CHECKED,
                STATE_INTERDEMINATE,
            ]),
        ];
    }

    public render(ctx: RenderContext) {
        this.createBox(ctx);
        this.createText(ctx);
    }

    private createBox(ctx: RenderContext) {
        const s = BOX_SIZE;
        const x = BOX_MARGIN;
        const y = (ctx.rect.height - s) * 0.5;

        const bounds = new Rect2(x, y, s, s);

        const boxItem = ctx.renderer.createRectangle(ctx.shape, 0, bounds);

        ctx.renderer.setStrokeColor(boxItem, ctx.shape);
        ctx.renderer.setBackgroundColor(boxItem, ctx.shape);

        ctx.add(boxItem);

        const state = ctx.shape.getAppearance(STATE_KEY);

        if (state === STATE_INTERDEMINATE) {
            const interdeminateBoxItem = ctx.renderer.createRectangle(0, 0, bounds.deflate(4));

            ctx.renderer.setBackgroundColor(interdeminateBoxItem, ctx.shape.strokeColor);

            ctx.add(interdeminateBoxItem);
        } else if (state === STATE_CHECKED) {
            const checkPathItem = ctx.renderer.createPath(2, `M${bounds.left + 3} ${bounds.cy + 2} L${bounds.left + bounds.width * 0.4} ${bounds.bottom - 4} L${bounds.right - 3} ${bounds.top + 3}`);

            ctx.renderer.setStrokeStyle(checkPathItem, 'butt', 'butt');
            ctx.renderer.setStrokeColor(checkPathItem, ctx.shape);

            ctx.add(checkPathItem);
        }
    }

    private createText(ctx: RenderContext) {
        const w = ctx.rect.width - TEXT_POSITION_X;
        const h = ctx.rect.height;

        const textItem = ctx.renderer.createSinglelineText(ctx.shape, new Rect2(TEXT_POSITION_X, 0, w, h));

        ctx.add(textItem);
    }
}
