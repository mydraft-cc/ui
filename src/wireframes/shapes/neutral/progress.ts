import { Rect2, Vec2 } from '@app/core';

import {
    ColorConfigurable,
    Configurable,
    DiagramShape,
    SizeConstraint,
    SliderConfigurable
} from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';
import { CommonTheme } from './_theme';

const ACCENT_COLOR = 'ACCENT_COLOR';

const VALUE = 'VALUE';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FOREGROUND_COLOR] = 0xffffff;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_BACKGROUND_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;
DEFAULT_APPEARANCE[ACCENT_COLOR] = 0x2171b5;
DEFAULT_APPEARANCE[VALUE] = 50;

const CONFIGURABLES: Configurable[] = [
    new SliderConfigurable(VALUE, 'Value'),
    new ColorConfigurable(ACCENT_COLOR, 'Accent Color')
];

const HEIGHT_TOTAL = 16;

const CONSTRAINT = new SizeConstraint(undefined, HEIGHT_TOTAL);

export class Progress extends AbstractControl {
    public identifier(): string {
        return 'Progress';
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(shapeId, this.identifier(), 150, HEIGHT_TOTAL, CONFIGURABLES, DEFAULT_APPEARANCE, CONSTRAINT);
    }

    protected renderInternal(ctx: AbstractContext) {
        this.createBackground(ctx);
        this.createBorder(ctx);
    }

    private createBackground(ctx: AbstractContext) {
        const relative = ctx.shape.appearance.get(VALUE) / 100;

        const clipMask = ctx.renderer.createRoundedRectangle(ctx.bounds, 0, ctx.bounds.height * 0.5);

        const activeRect = new Rect2(ctx.bounds.position, new Vec2(ctx.bounds.width * relative, ctx.bounds.height));
        const activeItem = ctx.renderer.createRoundedRectangle(activeRect, 0, 0);

        ctx.renderer.setBackgroundColor(activeItem, ctx.shape.appearance.get(ACCENT_COLOR));

        const inactiveRect = new Rect2(new Vec2(ctx.bounds.width * relative, ctx.bounds.top), new Vec2(ctx.bounds.width * (1 - relative), ctx.bounds.height));
        const inactiveItem = ctx.renderer.createRoundedRectangle(inactiveRect, 0, 0);

        ctx.renderer.setBackgroundColor(inactiveItem, ctx.shape);

        ctx.add(ctx.renderer.createClipGroup(clipMask, activeItem, inactiveItem));
    }

    private createBorder(ctx: AbstractContext) {
        const borderItem = ctx.renderer.createRoundedRectangle(ctx.bounds, ctx.shape, ctx.bounds.height * 0.51);

        ctx.renderer.setStrokeColor(borderItem, ctx.shape);

        ctx.add(borderItem);
    }
}