import { Rect2, Vec2 } from '@app/core';

import {
    Configurable,
    DiagramShape,
    SelectionConfigurable
} from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';

const STATE_KEY = 'STATE';
const STATE_NORMAL = 'Normal';
const STATE_CHECKED = 'Checked';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FOREGROUND_COLOR] = 0x238b45;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_BACKGROUND_COLOR] = 0xbdbdbd;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT_DISABLED] = true;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_COLOR] = 0xffffff;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_THICKNESS] = 4;
DEFAULT_APPEARANCE[STATE_KEY] = STATE_CHECKED;

const CONFIGURABLES: Configurable[] = [
    new SelectionConfigurable(STATE_KEY, 'State',
        [
            STATE_NORMAL,
            STATE_CHECKED
        ])
];

export class Toggle extends AbstractControl {
    public identifier(): string {
        return 'Toggle';
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(shapeId, this.identifier(), 60, 30, CONFIGURABLES, DEFAULT_APPEARANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        const border = ctx.shape.appearance.get(DiagramShape.APPEARANCE_STROKE_THICKNESS);

        const radius = Math.min(ctx.shape.transform.size.x, ctx.shape.transform.size.y) * 0.5;

        let circleY = ctx.bounds.height * 0.5;
        let circleX = radius;

        const isUnchecked = ctx.shape.appearance.get(STATE_KEY) === STATE_NORMAL;

        if (!isUnchecked) {
            circleX = ctx.bounds.width - circleX;
        }

        const circleCenter = new Vec2(circleX, circleY);
        const circleSize = radius - border;
        const circleItem = ctx.renderer.createEllipse(Rect2.createFromCenter(circleCenter, circleSize));

        ctx.renderer.setBackgroundColor(circleItem, ctx.shape.appearance.get(DiagramShape.APPEARANCE_STROKE_COLOR));

        const pillItem = ctx.renderer.createRectangle(ctx.bounds, 0, radius);

        if (isUnchecked) {
            ctx.renderer.setBackgroundColor(pillItem, ctx.shape);
        } else {
            ctx.renderer.setBackgroundColor(pillItem, ctx.shape.appearance.get(DiagramShape.APPEARANCE_FOREGROUND_COLOR));
        }

        ctx.add(pillItem);
        ctx.add(circleItem);
    }
}