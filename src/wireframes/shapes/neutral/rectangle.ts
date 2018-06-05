import {
    Configurable,
    DiagramShape,
    SliderConfigurable
} from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';
import { CommonTheme } from './_theme';

const BORDER_RADIUS_KEY = 'BORDER_RADIUS';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FOREGROUND_COLOR] = 0;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_BACKGROUND_COLOR] = 0xFFFFFF;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT] = 'Rectangle';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT_ALIGNMENT] = 'center';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;
DEFAULT_APPEARANCE[BORDER_RADIUS_KEY] = 0;

const CONFIGURABLES: Configurable[] = [
    new SliderConfigurable(BORDER_RADIUS_KEY, 'Border Radius', 0, 40)
];

export class Rectangle extends AbstractControl {
    public identifier(): string {
        return 'Rectangle';
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(shapeId, this.identifier(), 100, 60, CONFIGURABLES, DEFAULT_APPEARANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        this.createShape(ctx);
        this.createText(ctx);
    }

    private createShape(ctx: AbstractContext) {
        const borderRadius =  ctx.shape.appearance.get(BORDER_RADIUS_KEY);

        const shapeItem = ctx.renderer.createRoundedRectangle(ctx.bounds, ctx.shape, borderRadius);

        ctx.renderer.setStrokeColor(shapeItem, ctx.shape);
        ctx.renderer.setBackgroundColor(shapeItem, ctx.shape);

        ctx.add(shapeItem);
    }

    private createText(ctx: AbstractContext) {
        const textItem = ctx.renderer.createSinglelineText(ctx.bounds.deflate(10, 10), ctx.shape);

        ctx.renderer.setForegroundColor(textItem, ctx.shape);

        ctx.add(textItem);
    }
}