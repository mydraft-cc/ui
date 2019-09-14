import { Rect2, Vec2 } from '@app/core';

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

const HEIGHT_TOTAL = 20;
const HEIGHT_BORDER = 8;

const CONSTRAINT = new SizeConstraint(undefined, HEIGHT_TOTAL);

export class Slider extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'Slider';
    }

    public createDefaultShape(shapeId: string): DiagramItem {
        return DiagramItem.createShape(shapeId, this.identifier(), 150, HEIGHT_TOTAL, CONFIGURABLES, DEFAULT_APPEARANCE, CONSTRAINT);
    }

    protected renderInternal(ctx: AbstractContext) {
        const sliderRect = new Rect2(HEIGHT_TOTAL * 0.5, (HEIGHT_TOTAL - HEIGHT_BORDER) * 0.5, ctx.bounds.width - HEIGHT_TOTAL, HEIGHT_BORDER);

        const relative = ctx.shape.appearance.get(VALUE) / 100;

        this.createBackground(ctx, sliderRect, relative);
        this.createBorder(ctx, sliderRect);
        this.createThumb(ctx, relative);
    }

    private createThumb(ctx: AbstractContext, relative: number) {
        const thumbCenter = new Vec2(ctx.bounds.x + ctx.bounds.width * relative, 0.5 * HEIGHT_TOTAL);
        const thumbItem = ctx.renderer.createEllipse(ctx.shape, Rect2.fromCenter(thumbCenter, 0.5 * HEIGHT_TOTAL));

        ctx.renderer.setStrokeColor(thumbItem, ctx.shape);
        ctx.renderer.setBackgroundColor(thumbItem, ctx.shape.appearance.get(DiagramItem.APPEARANCE_FOREGROUND_COLOR));

        ctx.add(thumbItem);
    }

    private createBackground(ctx: AbstractContext, bounds: Rect2, relative: number) {
        const clipMask = ctx.renderer.createRectangle(0, bounds.height * 0.5, bounds);

        const activeRect = new Rect2(bounds.x, bounds.y, bounds.width * relative, bounds.height);
        const activeItem = ctx.renderer.createRectangle(0, 0, activeRect);

        ctx.renderer.setBackgroundColor(activeItem, ctx.shape.appearance.get(ACCENT_COLOR));

        const inactiveRect = new Rect2(bounds.x + bounds.width * relative, bounds.top, bounds.width * (1 - relative), bounds.height);
        const inactiveItem = ctx.renderer.createRectangle(0, 0, inactiveRect);

        ctx.renderer.setBackgroundColor(inactiveItem, ctx.shape);

        ctx.add(ctx.renderer.createGroup([activeItem, inactiveItem], clipMask));
    }

    private createBorder(ctx: AbstractContext, bounds: Rect2) {
        const borderItem = ctx.renderer.createRectangle(ctx.shape, bounds.height * 0.5, bounds);

        ctx.renderer.setStrokeColor(borderItem, ctx.shape);

        ctx.add(borderItem);
    }
}