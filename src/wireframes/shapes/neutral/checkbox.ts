/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConfigurableFactory, ConstraintFactory, DefaultAppearance, Rect2, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const STATE = 'STATE';
const STATE_NORMAL = 'Normal';
const STATE_CHECKED = 'Checked';
const STATE_INTERDEMINATE = 'Interdeminate';
const BOX_SIZE = 18;
const BOX_MARGIN = 4;
const TEXT_POSITION_X = BOX_SIZE + 2 * BOX_MARGIN;

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: CommonTheme.CONTROL_BACKGROUND_COLOR,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: CommonTheme.CONTROL_TEXT_COLOR,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'left',
    [DefaultAppearance.TEXT]: 'Checkbox',
    [STATE]: STATE_NORMAL,
};

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
            factory.selection(STATE, 'State', [
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
        const appearance = ctx.shape;
        const bounds = new Rect2(x, y, s, s);
        const isDark = ctx.designThemeMode === 'dark';
        
        // Get theme-aware colors
        const controlBg = isDark ? 0x333333 : CommonTheme.CONTROL_BACKGROUND_COLOR;
        const controlBorder = isDark ? 0x505050 : CommonTheme.CONTROL_BORDER_COLOR;

        ctx.renderer2.rectangle(ctx.shape, 0, bounds, p => {
            // Use theme-aware colors if the shape has default colors
            if (appearance.getAppearance(DefaultAppearance.BACKGROUND_COLOR) === CommonTheme.CONTROL_BACKGROUND_COLOR) {
                p.setBackgroundColor(controlBg);
            } else {
                p.setBackgroundColor(ctx.shape);
            }
            
            if (appearance.getAppearance(DefaultAppearance.STROKE_COLOR) === CommonTheme.CONTROL_BORDER_COLOR) {
                p.setStrokeColor(controlBorder);
            } else {
                p.setStrokeColor(ctx.shape);
            }
        });

        const state = ctx.shape.getAppearance(STATE);

        if (state === STATE_INTERDEMINATE) {
            ctx.renderer2.rectangle(0, 0, bounds.deflate(4), p => {
                p.setBackgroundColor(ctx.shape.strokeColor);
            });
        } else if (state === STATE_CHECKED) {
            const path = `M${bounds.left + 3} ${bounds.cy + 2} L${bounds.left + bounds.width * 0.4} ${bounds.bottom - 4} L${bounds.right - 3} ${bounds.top + 3}`;

            ctx.renderer2.path(2, path, p => {
                p.setStrokeColor(ctx.shape);
                p.setStrokeStyle('butt', 'butt');
            });
        }
    }

    private createText(ctx: RenderContext) {
        const w = ctx.rect.width - TEXT_POSITION_X;
        const h = ctx.rect.height;
        const appearance = ctx.shape;
        const isDark = ctx.designThemeMode === 'dark';
        const textColor = isDark ? 0xe0e0e0 : CommonTheme.CONTROL_TEXT_COLOR;

        ctx.renderer2.text(ctx.shape, new Rect2(TEXT_POSITION_X, 0, w, h), p => {
            // Use theme-aware text color if the shape has default color
            if (appearance.getAppearance(DefaultAppearance.FOREGROUND_COLOR) === CommonTheme.CONTROL_TEXT_COLOR) {
                p.setForegroundColor(textColor);
            } else {
                p.setForegroundColor(ctx.shape);
            }
        });
    }
}
