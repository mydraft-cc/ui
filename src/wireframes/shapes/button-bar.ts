import {
    Color,
    Rect2,
    Vec2
} from '@app/core'

import {
    ColorConfigurable,
    Configurable,
    DiagramShape
} from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from './utils/abstract-control';

const ACCENT_COLOR = 'ACCENT_COLOR';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FOREGROUND_COLOR] = AbstractControl.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_BACKGROUND_COLOR] = AbstractControl.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT] = 'left,middle*,right';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT_ALIGNMENT] = 'center';
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_FONT_SIZE] = AbstractControl.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_COLOR] = AbstractControl.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_STROKE_THICKNESS] = AbstractControl.CONTROL_BORDER_THICKNESS;
DEFAULT_APPEARANCE[ACCENT_COLOR] = 0x2171b5;

const CONFIGURABLES: Configurable[] = [
    new ColorConfigurable(ACCENT_COLOR, 'Accent Color')
];

export class ButtonBar extends AbstractControl {
    public identifier(): string {
        return 'ButtonBar';
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(this.identifier(), 180, 30, CONFIGURABLES, DEFAULT_APPEARANCE, shapeId);
    }

    protected renderInternal(ctx: AbstractContext) {
        const parts = this.parseText(ctx.shape);

        const w = Math.round(ctx.shape.transform.size.x / parts.length);
        const h = ctx.shape.transform.size.y;

        const accentColor = Color.fromValue(ctx.shape.appearance.get(ACCENT_COLOR));

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            const bounds = new Rect2(new Vec2(w * i, 0), new Vec2(w, h));

            let partItem: any;

            if (parts.length === 1) {
                partItem = ctx.renderer.createRoundedRectangle(bounds, ctx.shape, AbstractControl.CONTROL_BORDER_RADIUS);
            } else if (i === 0) {
                partItem = ctx.renderer.createRoundedRectangleLeft(bounds, ctx.shape, AbstractControl.CONTROL_BORDER_RADIUS);
            } else if (i === parts.length - 1) {
                partItem = ctx.renderer.createRoundedRectangleRight(bounds, ctx.shape, AbstractControl.CONTROL_BORDER_RADIUS);
            } else {
                partItem = ctx.renderer.createRoundedRectangle(bounds, ctx.shape, 0);
            }

            ctx.renderer.setStrokeColor(partItem, ctx.shape);

            if (part.selected) {
                ctx.renderer.setBackgroundColor(partItem, accentColor);
            } else {
                ctx.renderer.setBackgroundColor(partItem, ctx.shape);
            }

            const textItem = ctx.renderer.createSinglelineText(bounds.deflate(4, 4), ctx.shape);

            if (part.selected) {
                if (accentColor.luminance > 0.4) {
                    ctx.renderer.setForegroundColor(textItem, 0);
                } else {
                    ctx.renderer.setForegroundColor(textItem, 0xffffff);
                }
            }

            textItem.textItem.content = part.text;

            ctx.add(partItem);
            ctx.add(textItem.groupItem);
        }
    }

    private parseText(shape: DiagramShape) {
        const text: string = shape.appearance.get(DiagramShape.APPEARANCE_TEXT) || '';
        const parts = text.split(',');

        return parts.map(t => {
            const selected = t.endsWith('*');

            if (selected) {
                return { text: t.substr(0, t.length - 1).trim(), selected };
            } else {
                return { text: t, selected: false };
            }
        });
    }
}