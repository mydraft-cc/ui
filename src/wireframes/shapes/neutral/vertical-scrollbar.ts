import { Rect2 } from '@app/core';

import {
    Configurable,
    DiagramItem,
    SliderConfigurable
} from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';

import { CommonTheme } from './_theme';

const BAR_SIZE = 'BAR_SIZE';
const BAR_POSITION = 'BAR_POSITION';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_BACKGROUND_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_THICKNESS] = 2;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT_DISABLED] = true;
DEFAULT_APPEARANCE[BAR_SIZE] = 50;
DEFAULT_APPEARANCE[BAR_POSITION] = 0;

const CONFIGURABLES: Configurable[] = [
    new SliderConfigurable(BAR_SIZE, 'Bar Size'),
    new SliderConfigurable(BAR_POSITION, 'Bar Position')
];

export class VerticalScrollbar extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'VerticalScrollbar';
    }

    public createDefaultShape(shapeId: string): DiagramItem {
        return DiagramItem.createShape(shapeId, this.identifier(), 20, 300, CONFIGURABLES, DEFAULT_APPEARANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        const clickSize = Math.min(30, Math.min(0.8 * ctx.bounds.height, ctx.bounds.width));

        this.createBackground(ctx, clickSize);
        this.createBorder(ctx);
        this.createTopTriangle(ctx, clickSize);
        this.createBottomTriangle(ctx, clickSize);
    }

    private createBackground(ctx: AbstractContext, clickSize: number) {
        const barSize = ctx.shape.appearance.get(BAR_SIZE) / 100;
        const barPosition = ctx.shape.appearance.get(BAR_POSITION) / 100 * (ctx.bounds.height - 2 * clickSize) * (1 - barSize);

        const clipMask = ctx.renderer.createRectangle(0, 0, ctx.bounds);

        const barBounds = new Rect2(ctx.bounds.x, ctx.bounds.y + clickSize + barPosition, ctx.bounds.width, (ctx.bounds.height - 2 * clickSize) * barSize);
        const barItem = ctx.renderer.createRectangle(0, 0, barBounds);

        ctx.renderer.setBackgroundColor(barItem, 0xbdbdbd);

        const railItem = ctx.renderer.createRectangle(0, 0, ctx.bounds);

        ctx.renderer.setBackgroundColor(railItem, ctx.shape);

        ctx.add(ctx.renderer.createGroup([railItem, barItem], clipMask));
    }

    private createBorder(ctx: AbstractContext) {
        const borderItem = ctx.renderer.createRectangle(ctx.shape, 0, ctx.bounds);

        ctx.renderer.setStrokeColor(borderItem, ctx.shape);

        ctx.add(borderItem);
    }

    private createBottomTriangle(ctx: AbstractContext, clickSize: number) {
        const y = ctx.bounds.height - 0.5 * clickSize;
        const x = ctx.bounds.right * 0.5;
        const w = clickSize * 0.3;
        const h = clickSize * 0.3;

        const bottomTriangleItem = ctx.renderer.createPath(0, `M${x - 0.5 * w},${y - 0.4 * h} L${x},${y + 0.6 * h},L${x + 0.5 * w},${y - 0.4 * h} z`);

        ctx.renderer.setBackgroundColor(bottomTriangleItem, 0xbdbdbd);

        ctx.add(bottomTriangleItem);
    }

    private createTopTriangle(ctx: AbstractContext, clickSize: number) {
        const y = ctx.bounds.top + 0.5 * clickSize;
        const x = ctx.bounds.right * 0.5;
        const w = clickSize * 0.3;
        const h = clickSize * 0.3;

        const topTriangleItem = ctx.renderer.createPath(0, `M${x - 0.5 * w},${y + 0.4 * h} L${x},${y - 0.6 * h},L${x + 0.5 * w},${y + 0.4 * h} z`);

        ctx.renderer.setBackgroundColor(topTriangleItem, 0xbdbdbd);

        ctx.add(topTriangleItem);
    }
}
