import {
    Configurable,
    DiagramShape,
    SelectionConfigurable
} from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from './utils/abstract-control';

const SHAPE_KEY = 'SHAPE';
const SHAPE_RECTANGLE = 'Rectangle';
const SHAPE_ROUNDED_RECTANGLE = 'Rounded Rectangle';
const SHAPE_ELLIPSE = 'Ellipse';
const SHAPE_TRIANGLE = 'Triangle';
const SHAPE_STAR = 'Star';
const SHAPE_RHOMBUS = 'Rhombus';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FOREGROUND_COLOR] = 0;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_BACKGROUND_COLOR] = 0xFFFFFF;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT] = 'Shape';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT_ALIGNMENT] = 'center';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FONT_SIZE] = AbstractControl.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_COLOR] = 0;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_THICKNESS] = AbstractControl.CONTROL_BORDER_THICKNESS;
DEFAULT_APPEARANCE[SHAPE_KEY] = SHAPE_RECTANGLE;

const CONFIGURABLES: Configurable[] = [
    new SelectionConfigurable(SHAPE_KEY, 'Shape',
        [
            SHAPE_RECTANGLE,
            SHAPE_ROUNDED_RECTANGLE,
            SHAPE_ELLIPSE,
            SHAPE_TRIANGLE,
            SHAPE_RHOMBUS,
            SHAPE_STAR
        ])
];

export class Shape extends AbstractControl {
    public identifier(): string {
        return 'Shape';
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(this.identifier(), 100, 100, CONFIGURABLES, DEFAULT_APPEARANCE, shapeId);
    }

    protected renderInternal(ctx: AbstractContext) {
        this.createShape(ctx);
        this.createText(ctx);
    }

    private createShape(ctx: AbstractContext) {
        let shapeItem: any;

        const b = ctx.bounds;

        const shapeType = ctx.shape.appearance.get(SHAPE_KEY);

        const diameter = Math.min(b.width, b.height);

        if (shapeType === SHAPE_ROUNDED_RECTANGLE) {
            shapeItem = ctx.renderer.createRoundedRectangle(b, ctx.shape, 10);
        } else if (shapeType === SHAPE_STAR) {
            shapeItem = ctx.renderer.createStar(b.center, 6, diameter / 4, diameter / 2, ctx.shape);
        } else if (shapeType === SHAPE_ELLIPSE) {
            shapeItem = ctx.renderer.createEllipse(b, ctx.shape);
        } else if (shapeType === SHAPE_TRIANGLE) {
            shapeItem = ctx.renderer.createBoundedPath(b, `M0 ${b.bottom} L${b.centerX} ${b.top} L${b.right} ${b.bottom} z`, ctx.shape);
        } else if (shapeType === SHAPE_RHOMBUS) {
            shapeItem = ctx.renderer.createPath(`M${b.centerX} ${b.top} L${b.right} ${b.centerY} L${b.centerX} ${b.bottom} L${b.left} ${b.centerY} z`, ctx.shape);
        } else {
            shapeItem = ctx.renderer.createRoundedRectangle(b, ctx.shape, 0);
        }

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