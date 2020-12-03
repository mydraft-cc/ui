import { Rect2 } from '@app/core';

import {
    Configurable,
    DiagramItem,
    SizeConstraint,
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

const HEIGHT_TOTAL = 20;
const HEIGHT_CONSTRAINT = new SizeConstraint(undefined, HEIGHT_TOTAL);

export class HorizontalScrollbar extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'HorizontalScrollbar';
    }

    public createDefaultShape(shapeId: string): DiagramItem {
        return DiagramItem.createShape(shapeId, this.identifier(), 300, HEIGHT_TOTAL, CONFIGURABLES, DEFAULT_APPEARANCE, HEIGHT_CONSTRAINT);
    }

    protected renderInternal(ctx: AbstractContext) {
        const clickSize = Math.min(30, Math.min(0.8 * ctx.bounds.width, ctx.bounds.height));

        this.createBackground(ctx, clickSize);
        this.createBorder(ctx);
        this.createRightTriangle(ctx, clickSize);
        this.createLeftTriangle(ctx, clickSize);
    }

    private createBackground(ctx: AbstractContext, clickSize: number) {
        const barSize = ctx.shape.appearance.get(BAR_SIZE) / 100;
        const barPosition = ctx.shape.appearance.get(BAR_POSITION) / 100 * (ctx.bounds.width - 2 * clickSize) * (1 - barSize);

        const clipMask = ctx.renderer.createRectangle(0, 0, ctx.bounds);

         const barBounds = new Rect2(ctx.bounds.x + clickSize + barPosition, ctx.bounds.y, (ctx.bounds.width - 2 * clickSize) * barSize, ctx.bounds.height);
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

    private createRightTriangle(ctx: AbstractContext, clickSize: number) {
        const y = ctx.bounds.height * 0.5;
        const x = ctx.bounds.right - 0.5 * clickSize;
        const w = clickSize * 0.3;
        const h = clickSize * 0.3;

        const rightTriangleItem = ctx.renderer.createPath(0, `M${x - 0.4 * w},${y - 0.5 * h} L${x + 0.6 * w},${y},L${x - 0.4 * w},${y + 0.5 * h} z`);

        ctx.renderer.setBackgroundColor(rightTriangleItem, 0xbdbdbd);

        ctx.add(rightTriangleItem);
    }

    private createLeftTriangle(ctx: AbstractContext, clickSize: number) {
        const y = ctx.bounds.height * 0.5;
        const x = ctx.bounds.left + 0.5 * clickSize;
        const w = clickSize * 0.3;
        const h = clickSize * 0.3;

        const leftTriangleItem = ctx.renderer.createPath(0, `M${x + 0.4 * w},${y - 0.5 * h} L${x - 0.6 * w},${y},L${x + 0.4 * w},${y + 0.5 * h} z`);

        ctx.renderer.setBackgroundColor(leftTriangleItem, 0xbdbdbd);

        ctx.add(leftTriangleItem);
    }
}
