/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConfigurableFactory, DefaultAppearance, Rect2, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const BAR_SIZE = 'BAR_SIZE';
const BAR_POSITION = 'BAR_POSITION';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.BACKGROUND_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_THICKNESS] = 2;
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_DISABLED] = true;
DEFAULT_APPEARANCE[BAR_SIZE] = 50;
DEFAULT_APPEARANCE[BAR_POSITION] = 0;

export class VerticalScrollbar implements ShapePlugin {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'VerticalScrollbar';
    }

    public defaultSize() {
        return { x: 20, y: 300 };
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.slider(BAR_SIZE, 'Bar Size', 0, 100),
            factory.slider(BAR_POSITION, 'Bar Position', 0, 100),
        ];
    }

    public render(ctx: RenderContext) {
        const clickSize = Math.min(30, Math.min(0.8 * ctx.rect.height, ctx.rect.width));

        this.createBackground(ctx, clickSize);
        this.createBorder(ctx);
        this.createTopTriangle(ctx, clickSize);
        this.createBottomTriangle(ctx, clickSize);
    }

    private createBackground(ctx: RenderContext, clickSize: number) {
        ctx.renderer2.group(items => {
            const barSize = ctx.shape.getAppearance(BAR_SIZE) / 100;
            const barPosition = ctx.shape.getAppearance(BAR_POSITION) / 100 * (ctx.rect.height - 2 * clickSize) * (1 - barSize);
            const barRect = new Rect2(ctx.rect.x, ctx.rect.y + clickSize + barPosition, ctx.rect.width, (ctx.rect.height - 2 * clickSize) * barSize);

            // Bar
            items.rectangle(0, 0, barRect, p => {
                p.setBackgroundColor(0xbdbdbd);
            });

            // Rail
            items.rectangle(0, 0, barRect, p => {
                p.setBackgroundColor(ctx.shape);
            });
        }, mask => {
            mask.rectangle(0, 0, ctx.rect);
        });
    }

    private createBorder(ctx: RenderContext) {
        ctx.renderer2.rectangle(ctx.shape, 0, ctx.rect, p => {
            p.setStrokeColor(ctx.shape);
        });
    }

    private createBottomTriangle(ctx: RenderContext, clickSize: number) {
        const y = ctx.rect.height - 0.5 * clickSize;
        const x = ctx.rect.right * 0.5;
        const w = clickSize * 0.3;
        const h = clickSize * 0.3;

        ctx.renderer2.path(0, `M${x - 0.5 * w},${y - 0.4 * h} L${x},${y + 0.6 * h},L${x + 0.5 * w},${y - 0.4 * h} z`, undefined, p => {
            p.setBackgroundColor(0xbdbdbd);
        });
    }

    private createTopTriangle(ctx: RenderContext, clickSize: number) {
        const y = ctx.rect.top + 0.5 * clickSize;
        const x = ctx.rect.right * 0.5;
        const w = clickSize * 0.3;
        const h = clickSize * 0.3;

        ctx.renderer2.path(0, `M${x - 0.5 * w},${y + 0.4 * h} L${x},${y - 0.6 * h},L${x + 0.5 * w},${y + 0.4 * h} z`, undefined, p => {
            p.setBackgroundColor(0xbdbdbd);
        });
    }
}
