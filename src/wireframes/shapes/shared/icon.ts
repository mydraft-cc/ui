/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.FOREGROUND_COLOR] = 0;
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_DISABLED] = true;

export class Icon implements ShapePlugin {
    public identifier(): string {
        return 'Icon';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 40, y: 40 };
    }

    public showInGallery() {
        return false;
    }

    public render(ctx: RenderContext) {
        const fontSize = Math.min(ctx.rect.w, ctx.rect.h) - 10;

        const config = { fontSize, text: ctx.shape.text, alignment: 'center' };

        const textItem = ctx.renderer.createSinglelineText(config, ctx.rect);

        ctx.renderer.setForegroundColor(textItem, ctx.shape);
        ctx.renderer.setFontFamily(textItem, ctx.shape.getAppearance(DefaultAppearance.ICON_FONT_FAMILY) || 'FontAwesome');

        ctx.add(textItem);
    }
}
