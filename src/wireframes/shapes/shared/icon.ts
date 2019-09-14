import { DiagramItem } from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_FOREGROUND_COLOR] = 0;
DEFAULT_APPEARANCE[DiagramItem.APPEARANCE_TEXT_DISABLED] = true;

export class Icon extends AbstractControl {
    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public identifier(): string {
        return 'Icon';
    }

    public showInGallery() {
        return false;
    }

    public createDefaultShape(shapeId: string): DiagramItem {
        return DiagramItem.createShape(shapeId, this.identifier(), 40, 40, undefined, DEFAULT_APPEARANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        const fontSize = Math.min(ctx.bounds.w, ctx.bounds.h) - 10;

        const config = { fontSize, text: ctx.shape.appearance.get(DiagramItem.APPEARANCE_TEXT), alignment: 'center' };

        const textItem = ctx.renderer.createSinglelineText(config, ctx.bounds);

        ctx.renderer.setForegroundColor(textItem, ctx.shape);
        ctx.renderer.setFontFamily(textItem, ctx.shape.appearance.get(DiagramItem.APPEARANCE_ICON_FONT_FAMILY) || 'FontAwesome');

        ctx.add(textItem);
    }
}