/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';
import { SHAPE_TEXT_COLOR, getCurrentTheme } from './ThemeShapeUtils';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: SHAPE_TEXT_COLOR.LIGHT,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'left',
    [DefaultAppearance.TEXT]: 'Lorem ipsum dolor sit amet, alii rebum postea eam ex. Et mei laoreet officiis, summo sensibus id mei.',
};

export class Paragraph implements ShapePlugin {
    public identifier(): string {
        return 'Paragraph';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 200, y: 140 };
    }

    public previewSize(desiredWidth: number, desiredHeight: number) {
        return { x: desiredWidth * 2, y: desiredHeight * 2 };
    }

    public render(ctx: RenderContext) {
        const appearance = ctx.shape;
        const isDark = getCurrentTheme() === 'dark';
        const textColor = isDark ? SHAPE_TEXT_COLOR.DARK : SHAPE_TEXT_COLOR.LIGHT;
        
        ctx.renderer2.textMultiline(ctx.shape, ctx.rect, p => {
            // Use theme-aware text color if the shape has default color
            if (appearance.getAppearance(DefaultAppearance.FOREGROUND_COLOR) === SHAPE_TEXT_COLOR.LIGHT) {
                p.setForegroundColor(textColor);
            } else {
                p.setForegroundColor(ctx.shape);
            }
        }, true);
    }
}
