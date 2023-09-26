/*
 * mydraft.cc
 *
 * Author: Duc Quan Do
 * Date: 24/09/2023
*/

import { DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.FONT_SIZE]: CommonTheme.CONTROL_FONT_SIZE,
    [DefaultAppearance.FOREGROUND_COLOR]: CommonTheme.CONTROL_TEXT_COLOR,
    [DefaultAppearance.TEXT_ALIGNMENT]: 'left',
    [DefaultAppearance.TEXT]: 'c = \\pm\\sqrt{a^2 + b^2}',
};

export class Equation implements ShapePlugin {
    public identifier(): string {
        return 'Equation';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 140, y: 50 };
    }

    public render(ctx: RenderContext) {
        ctx.renderer2.equation(ctx.shape, ctx.rect, undefined);
    }
}
