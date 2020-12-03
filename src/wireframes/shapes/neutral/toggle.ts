/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

// tslint:disable: prefer-const

import { ConfigurableFactory, DefaultAppearance, Rect2, RenderContext, ShapePlugin, Vec2 } from '@app/wireframes/interface';

const STATE = 'STATE';
const STATE_NORMAL = 'Normal';
const STATE_CHECKED = 'Checked';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.FOREGROUND_COLOR] = 0x238b45;
DEFAULT_APPEARANCE[DefaultAppearance.BACKGROUND_COLOR] = 0xbdbdbd;
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_DISABLED] = true;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_COLOR] = 0xffffff;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_THICKNESS] = 4;
DEFAULT_APPEARANCE[STATE] = STATE_CHECKED;

export class Toggle implements ShapePlugin {
    public identifier(): string {
        return 'Toggle';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 60, y: 30 };
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.selection(STATE, 'State',
            [
                STATE_NORMAL,
                STATE_CHECKED,
            ]),
        ];
    }

    public render(ctx: RenderContext) {
        const border = ctx.shape.strokeThickness;

        const radius = Math.min(ctx.rect.width, ctx.rect.height) * 0.5;

        let circleY = ctx.rect.height * 0.5;
        let circleX = radius;

        const isUnchecked = ctx.shape.getAppearance(STATE) === STATE_NORMAL;

        if (!isUnchecked) {
            circleX = ctx.rect.width - circleX;
        }

        const circleCenter = new Vec2(circleX, circleY);
        const circleSize = radius - border;
        const circleItem = ctx.renderer.createEllipse(0, Rect2.fromCenter(circleCenter, circleSize));

        ctx.renderer.setBackgroundColor(circleItem, ctx.shape.strokeColor);

        const pillItem = ctx.renderer.createRectangle(0, radius, ctx.rect);

        if (isUnchecked) {
            ctx.renderer.setBackgroundColor(pillItem, ctx.shape);
        } else {
            ctx.renderer.setBackgroundColor(pillItem, ctx.shape.foregroundColor);
        }

        ctx.add(pillItem);
        ctx.add(circleItem);
    }
}
