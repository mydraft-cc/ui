import { Rect2 } from '@app/core';

import {
    Configurable,
    DiagramItem,
    SelectionConfigurable,
    TextHeightConstraint
} from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';
import { CommonTheme } from './_theme';

const STATE_KEY = 'STATE';
const STATE_NORMAL = 'Normal';
const STATE_CHECKED = 'Checked';
const STATE_INTERDEMINATE = 'Interdeminate';
const BOX_SIZE = 18;
const BOX_MARGIN = 4;
const TEXT_POSITION_X = BOX_SIZE + 2 * BOX_MARGIN;

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_BACKGROUND_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT] = 'Checkbox';
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT_ALIGNMENT] = 'left';
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;
DEFAULT_APPEARANCE[STATE_KEY] = STATE_NORMAL;

const CONFIGURABLE: Configurable[] = [
    new SelectionConfigurable(STATE_KEY, 'State',
        [
            STATE_NORMAL,
            STATE_CHECKED,
            STATE_INTERDEMINATE
        ])
];

const CONSTRAINT = new TextHeightConstraint(8);

export class Checkbox extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'Checkbox';
    }

    public createDefaultShape(shapeId: string): DiagramItem {
        return DiagramItem.createShape(shapeId, this.identifier(), 104, 36, CONFIGURABLE, DEFAULT_APPEARANCE, CONSTRAINT);
    }

    protected renderInternal(ctx: AbstractContext) {
        this.createBox(ctx);
        this.createText(ctx);
    }

    private createBox(ctx: AbstractContext) {
        const s = BOX_SIZE;
        const x = BOX_MARGIN;
        const y = (ctx.bounds.h - s) * 0.5;

        const bounds = new Rect2(x, y, s, s);

        const boxItem = ctx.renderer.createRectangle(ctx.shape, 0, bounds);

        ctx.renderer.setStrokeColor(boxItem, ctx.shape);
        ctx.renderer.setBackgroundColor(boxItem, ctx.shape);

        ctx.add(boxItem);

        const state = ctx.shape.appearance.get(STATE_KEY);

        if (state === STATE_INTERDEMINATE) {
            const interdeminateBoxItem = ctx.renderer.createRectangle(0, 0, bounds.deflate(4));

            ctx.renderer.setBackgroundColor(interdeminateBoxItem, ctx.shape.appearance.get(DiagramItem.APPEARANCE_STROKE_COLOR));

            ctx.add(interdeminateBoxItem);
        } else if (state === STATE_CHECKED) {
            const checkPathItem = ctx.renderer.createPath(2, `M${bounds.left + 3} ${bounds.cy + 2} L${bounds.left + bounds.width * 0.4} ${bounds.bottom - 4} L${bounds.right - 3} ${bounds.top + 3}`);

            ctx.renderer.setStrokeStyle(checkPathItem, 'butt', 'butt');
            ctx.renderer.setStrokeColor(checkPathItem, ctx.shape);

            ctx.add(checkPathItem);
        }
    }

    private createText(ctx: AbstractContext) {
        const w = ctx.shape.transform.size.x - TEXT_POSITION_X;
        const h = ctx.shape.transform.size.y;

        const textItem = ctx.renderer.createSinglelineText(ctx.shape, new Rect2(TEXT_POSITION_X, 0, w, h));

        ctx.add(textItem);
    }
}