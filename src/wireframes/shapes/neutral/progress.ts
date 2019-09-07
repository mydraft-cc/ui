import { Rect2 } from '@app/core';

import {
    ColorConfigurable,
    Configurable,
    DiagramItem,
    SizeConstraint,
    SliderConfigurable
} from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';
import { CommonTheme } from './_theme';

const ACCENT_COLOR = 'ACCENT_COLOR';

const VALUE = 'VALUE';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FOREGROUND_COLOR] = 0xffffff;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_BACKGROUND_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT_DISABLED] = true;
DEFAULT_APPEARANCE[ACCENT_COLOR] = 0x2171b5;
DEFAULT_APPEARANCE[VALUE] = 50;

const CONFIGURABLES: Configurable[] = [
    new SliderConfigurable(VALUE, 'Value'),
    new ColorConfigurable(ACCENT_COLOR, 'Accent Color')
];

const HEIGHT_TOTAL = 16;

const CONSTRAINT = new SizeConstraint(undefined, HEIGHT_TOTAL);

export class Progress extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'Progress';
    }

    public createDefaultShape(shapeId: string): DiagramItem {
        return DiagramItem.createShape(shapeId, this.identifier(), 150, HEIGHT_TOTAL, CONFIGURABLES, DEFAULT_APPEARANCE, CONSTRAINT);
    }

    protected renderInternal(ctx: AbstractContext) {
        this.createBackground(ctx);
        this.createBorder(ctx);
    }

    private createBackground(ctx: AbstractContext) {
        const relative = ctx.shape.appearance.get(VALUE) / 100;

        const clipMask = ctx.renderer.createRectangle(0, ctx.bounds.height * 0.5, ctx.bounds);

        const activeBounds = new Rect2(ctx.bounds.x, ctx.bounds.y, ctx.bounds.width * relative, ctx.bounds.height);
        const activeItem = ctx.renderer.createRectangle(0, 0, activeBounds);

        ctx.renderer.setBackgroundColor(activeItem, ctx.shape.appearance.get(ACCENT_COLOR));

        const inactiveBounds = new Rect2(ctx.bounds.width * relative, ctx.bounds.top, ctx.bounds.width * (1 - relative), ctx.bounds.height);
        const inactiveItem = ctx.renderer.createRectangle(0, 0, inactiveBounds);

        ctx.renderer.setBackgroundColor(inactiveItem, ctx.shape);

        ctx.add(ctx.renderer.createGroup([activeItem, inactiveItem], clipMask));
    }

    private createBorder(ctx: AbstractContext) {
        const borderItem = ctx.renderer.createRectangle(ctx.shape, ctx.bounds.height * 0.5, ctx.bounds);

        ctx.renderer.setStrokeColor(borderItem, ctx.shape);

        ctx.add(borderItem);
    }
}