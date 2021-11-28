/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConfigurableFactory, DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const SHAPE = 'SHAPE';
const SHAPE_RECTANGLE = 'Rectangle';
const SHAPE_ROUNDED_RECTANGLE = 'Rounded Rectangle';
const SHAPE_ELLIPSE = 'Ellipse';
const SHAPE_TRIANGLE = 'Triangle';
const SHAPE_RHOMBUS = 'Rhombus';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.FOREGROUND_COLOR] = 0;
DEFAULT_APPEARANCE[DefaultAppearance.BACKGROUND_COLOR] = 0xFFFFFF;
DEFAULT_APPEARANCE[DefaultAppearance.TEXT] = 'Shape';
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_ALIGNMENT] = 'center';
DEFAULT_APPEARANCE[DefaultAppearance.FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;
DEFAULT_APPEARANCE[SHAPE] = SHAPE_RECTANGLE;

export class Shape implements ShapePlugin {
    public identifier(): string {
        return 'Shape';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 100, y: 100 };
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.selection(SHAPE, 'Shape', [
                SHAPE_RECTANGLE,
                SHAPE_ROUNDED_RECTANGLE,
                SHAPE_ELLIPSE,
                SHAPE_TRIANGLE,
                SHAPE_RHOMBUS,
            ]),
        ];
    }

    public render(ctx: RenderContext) {
        this.createShape(ctx);
        this.createText(ctx);
    }

    private createShape(ctx: RenderContext) {
        let shapeItem: any;

        const b = ctx.rect;

        const shapeType = ctx.shape.getAppearance(SHAPE);

        if (shapeType === SHAPE_ROUNDED_RECTANGLE) {
            shapeItem = ctx.renderer.createRectangle(ctx.shape, 10, ctx.rect);
        } else if (shapeType === SHAPE_ELLIPSE) {
            shapeItem = ctx.renderer.createEllipse(ctx.shape, ctx.rect);
        } else if (shapeType === SHAPE_TRIANGLE) {
            shapeItem = ctx.renderer.createPath(ctx.shape, `M0 ${b.bottom} L${b.cx} ${b.top} L${b.right} ${b.bottom} z`, ctx.rect);
        } else if (shapeType === SHAPE_RHOMBUS) {
            shapeItem = ctx.renderer.createPath(ctx.shape, `M${b.cx} ${b.top} L${b.right} ${b.cy} L${b.cx} ${b.bottom} L${b.left} ${b.cy} z`, ctx.rect);
        } else {
            shapeItem = ctx.renderer.createRectangle(ctx.shape, 0, ctx.rect);
        }

        ctx.renderer.setStrokeColor(shapeItem, ctx.shape);
        ctx.renderer.setBackgroundColor(shapeItem, ctx.shape);

        ctx.add(shapeItem);
    }

    private createText(ctx: RenderContext) {
        const textItem = ctx.renderer.createSinglelineText(ctx.shape, ctx.rect.deflate(10, 10));

        ctx.renderer.setForegroundColor(textItem, ctx.shape);

        ctx.add(textItem);
    }
}
