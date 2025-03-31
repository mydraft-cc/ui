/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ConfigurableFactory, DefaultAppearance, RenderContext, ShapePlugin, ShapeProperties } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const SHAPE = 'SHAPE';
const SHAPE_RECTANGLE = 'Rectangle';
const SHAPE_ROUNDED_RECTANGLE = 'Rounded Rectangle';
const SHAPE_ELLIPSE = 'Ellipse';
const SHAPE_TRIANGLE = 'Triangle';
const SHAPE_RHOMBUS = 'Rhombus';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: 0xFFFFFF,
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: 0,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'center',
    [DefaultAppearance.TEXT]: 'Shape',
    [SHAPE]: SHAPE_RECTANGLE,
};

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
        const b = ctx.rect;

        const shapeType = ctx.shape.getAppearance(SHAPE);

        if (shapeType === SHAPE_ROUNDED_RECTANGLE) {
            ctx.renderer2.rectangle(ctx.shape, 10, ctx.rect, p => {
                this.styleShape(ctx, p);
            });
        } else if (shapeType === SHAPE_ELLIPSE) {
            ctx.renderer2.ellipse(ctx.shape, ctx.rect, p => {
                this.styleShape(ctx, p);
            });
        } else if (shapeType === SHAPE_TRIANGLE) {
            const path = `M0 ${b.bottom} L${b.cx} ${b.top} L${b.right} ${b.bottom} z`;

            ctx.renderer2.path(ctx.shape, path, p => {
                this.styleShape(ctx, p);
            });
        } else if (shapeType === SHAPE_RHOMBUS) {
            const path = `M${b.cx} ${b.top} L${b.right} ${b.cy} L${b.cx} ${b.bottom} L${b.left} ${b.cy} z`;

            ctx.renderer2.path(ctx.shape, path, p => {
                this.styleShape(ctx, p);
            });
        } else {
            ctx.renderer2.rectangle(ctx.shape, 0, ctx.rect, p => {
                this.styleShape(ctx, p);
            });
        }
    }

    private styleShape(ctx: RenderContext, p: ShapeProperties) {
        p.setStrokeColor(ctx.shape);
        p.setBackgroundColor(ctx.shape);
    }

    private createText(ctx: RenderContext) {
        ctx.renderer2.text(ctx.shape, ctx.rect.deflate(10, 10), p => {
            p.setForegroundColor(ctx.shape);
        }, true);
    }
}
