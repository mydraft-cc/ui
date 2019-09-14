import { Color, Rect2 } from '@app/core';

import {
    ColorConfigurable,
    Configurable,
    DiagramItem
} from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';
import { CommonTheme } from './_theme';

const ACCENT_COLOR = 'ACCENT_COLOR';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_BACKGROUND_COLOR] = CommonTheme.CONTROL_BACKGROUND_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT] = 'left,middle*,right';
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT_ALIGNMENT] = 'center';
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_COLOR] = CommonTheme.CONTROL_BORDER_COLOR;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_STROKE_THICKNESS] = CommonTheme.CONTROL_BORDER_THICKNESS;
DEFAULT_APPEARANCE[ACCENT_COLOR] = 0x2171b5;

const CONFIGURABLES: Configurable[] = [
    new ColorConfigurable(ACCENT_COLOR, 'Accent Color')
];

export class ButtonBar extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'ButtonBar';
    }

    public createDefaultShape(shapeId: string): DiagramItem {
        return DiagramItem.createShape(shapeId, this.identifier(), 180, 30, CONFIGURABLES, DEFAULT_APPEARANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        const parts = this.parseText(ctx.shape);

        const w = Math.round(ctx.shape.transform.size.x / parts.length);
        const h = ctx.shape.transform.size.y;

        const accentColor = Color.fromValue(ctx.shape.appearance.get(ACCENT_COLOR));

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            const bounds = new Rect2(w * i, 0, w, h);

            let partItem: any;

            if (parts.length === 1) {
                partItem = ctx.renderer.createRectangle(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, bounds);
            } else if (i === 0) {
                partItem = ctx.renderer.createRoundedRectangleLeft(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, bounds);
            } else if (i === parts.length - 1) {
                partItem = ctx.renderer.createRoundedRectangleRight(ctx.shape, CommonTheme.CONTROL_BORDER_RADIUS, bounds);
            } else {
                partItem = ctx.renderer.createRectangle(ctx.shape, 0, bounds);
            }

            if (part.selected) {
                ctx.renderer.setBackgroundColor(partItem, accentColor);
                ctx.renderer.setStrokeColor(partItem, accentColor);
            } else {
                ctx.renderer.setBackgroundColor(partItem, ctx.shape);
                ctx.renderer.setStrokeColor(partItem, ctx.shape);
            }

            const textItem = ctx.renderer.createSinglelineText(ctx.shape, bounds.deflate(4));

            if (part.selected) {
                if (accentColor.luminance > 0.4) {
                    ctx.renderer.setForegroundColor(textItem, 0);
                } else {
                    ctx.renderer.setForegroundColor(textItem, 0xffffff);
                }
            }

            ctx.renderer.setText(textItem, part.text);

            ctx.add(partItem);
            ctx.add(textItem);
        }
    }

    private parseText(shape: DiagramItem) {
        const text: string = shape.appearance.get(DiagramItem.APPEARANCE_TEXT) || '';
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