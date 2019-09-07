import { Rect2, Vec2 } from '@app/core';

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
const CIRCLE_MARGIN = 4;
const CIRCLE_RADIUS = 9;
const CIRCLE_POSITION_X = CIRCLE_MARGIN + CIRCLE_RADIUS;
const CIRCLE_CHECK_RADIUS = CIRCLE_RADIUS - 4;
const TEXT_POSITION_X = 2 * CIRCLE_MARGIN + 2 * CIRCLE_RADIUS;

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_BACKGROUND_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT] = 'RadioButton';
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT_ALIGNMENT] = 'left';
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;
DEFAULT_APPEARANCE[STATE_KEY] = STATE_NORMAL;

const CONFIGURABLES: Configurable[] = [
    new SelectionConfigurable(STATE_KEY, 'State',
        [
            STATE_NORMAL,
            STATE_CHECKED
        ])
];

const CONSTRAINT = new TextHeightConstraint(8);

export class RadioButton extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'RadioButton';
    }

    public createDefaultShape(shapeId: string): DiagramItem {
        return DiagramItem.createShape(shapeId, this.identifier(), 130, 36, CONFIGURABLES, DEFAULT_APPEARANCE, CONSTRAINT);
    }

    protected renderInternal(ctx: AbstractContext) {
        this.createCircle(ctx);
        this.createText(ctx);
    }

    private createCircle(ctx: AbstractContext) {
        const y = 0.5 * ctx.bounds.h;

        const circleItem = ctx.renderer.createEllipse(ctx.shape, Rect2.fromCenter(new Vec2(CIRCLE_POSITION_X, y), CIRCLE_RADIUS));

        ctx.renderer.setStrokeColor(circleItem, ctx.shape);
        ctx.renderer.setBackgroundColor(circleItem, ctx.shape);

        ctx.add(circleItem);

        const state = ctx.shape.appearance.get(STATE_KEY);

        if (state === STATE_CHECKED) {
            const checkCircleItem = ctx.renderer.createEllipse(0, Rect2.fromCenter(new Vec2(CIRCLE_POSITION_X, y), CIRCLE_CHECK_RADIUS));

            ctx.renderer.setBackgroundColor(checkCircleItem, ctx.shape.appearance.get(DiagramItem.APPEARANCE_STROKE_COLOR));

            ctx.add(checkCircleItem);
        }
    }

    private createText(ctx: AbstractContext) {
        const w = ctx.shape.transform.size.x - TEXT_POSITION_X;
        const h = ctx.shape.transform.size.y;

        const textRect = new Rect2(TEXT_POSITION_X, 0, w, h);
        const textItem = ctx.renderer.createSinglelineText(ctx.shape, textRect);

        ctx.add(textItem);
    }
}