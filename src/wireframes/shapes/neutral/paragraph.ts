/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.FOREGROUND_COLOR] = CommonTheme.CONTROL_TEXT_COLOR;
DEFAULT_APPEARANCE[DefaultAppearance.TEXT] = 'Lorem ipsum dolor sit amet, alii rebum postea eam ex. Et mei laoreet officiis, summo sensibus id mei.';
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_ALIGNMENT] = 'left';
DEFAULT_APPEARANCE[DefaultAppearance.FONT_SIZE] = CommonTheme.CONTROL_FONT_SIZE;

export class Paragraph implements ShapePlugin {
    public identifier(): string {
        return 'Paragraph';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 170, y: 100 };
    }

    public previewSize(desiredWidth: number, desiredHeight: number) {
        return { x: desiredWidth, y: desiredHeight };
    }

    public render(ctx: RenderContext) {
        ctx.renderer2.textMultiline(ctx.shape, ctx.rect);
    }
}
