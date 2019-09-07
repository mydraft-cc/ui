import {
    Configurable,
    DiagramItem,
    SelectionConfigurable
} from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';
import { CommonTheme } from './_theme';

const SHAPE_KEY = 'SHAPE';
const SHAPE_RECTANGLE = 'Rectangle';
const SHAPE_ROUNDED_RECTANGLE = 'Rounded Rectangle';
const SHAPE_ELLIPSE = 'Ellipse';
const SHAPE_TRIANGLE = 'Triangle';
const SHAPE_RHOMBUS = 'Rhombus';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FOREGROUND_COLOR] = 0;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_BACKGROUND_COLOR] = 0xFFFFFF;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT] = 'Shape';
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT_ALIGNMENT] = 'center';
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;
DEFAULT_APPEARANCE[SHAPE_KEY] = SHAPE_RECTANGLE;

const CONFIGURABLES: Configurable[] = [
    new SelectionConfigurable(SHAPE_KEY, 'Shape',
        [
            SHAPE_RECTANGLE,
            SHAPE_ROUNDED_RECTANGLE,
            SHAPE_ELLIPSE,
            SHAPE_TRIANGLE,
            SHAPE_RHOMBUS
        ])
];

export class Shape extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'Shape';
    }

    public createDefaultShape(shapeId: string): DiagramItem {
        return DiagramItem.createShape(shapeId, this.identifier(), 100, 100, CONFIGURABLES, DEFAULT_APPEARANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        this.createShape(ctx);
        this.createText(ctx);
    }

    private createShape(ctx: AbstractContext) {
        let shapeItem: any;

        const b = ctx.bounds;

        const shapeType = ctx.shape.appearance.get(SHAPE_KEY);

        if (shapeType === SHAPE_ROUNDED_RECTANGLE) {
            shapeItem = ctx.renderer.createRectangle(ctx.shape, 10, ctx.bounds);
        } else if (shapeType === SHAPE_ELLIPSE) {
            shapeItem = ctx.renderer.createEllipse(ctx.shape, ctx.bounds);
        } else if (shapeType === SHAPE_TRIANGLE) {
            shapeItem = ctx.renderer.createPath(ctx.shape, `M0 ${b.bottom} L${b.cx} ${b.top} L${b.right} ${b.bottom} z`, ctx.bounds);
        } else if (shapeType === SHAPE_RHOMBUS) {
            shapeItem = ctx.renderer.createPath(ctx.shape, `M${b.cx} ${b.top} L${b.right} ${b.cy} L${b.cx} ${b.bottom} L${b.left} ${b.cy} z`, ctx.bounds);
        } else {
            shapeItem = ctx.renderer.createRectangle(ctx.shape, 0, ctx.bounds);
        }

        ctx.renderer.setStrokeColor(shapeItem, ctx.shape);
        ctx.renderer.setBackgroundColor(shapeItem, ctx.shape);

        ctx.add(shapeItem);
    }

    private createText(ctx: AbstractContext) {
        const textItem = ctx.renderer.createSinglelineText(ctx.shape, ctx.bounds.deflate(10, 10));

        ctx.renderer.setForegroundColor(textItem, ctx.shape);

        ctx.add(textItem);
    }
}