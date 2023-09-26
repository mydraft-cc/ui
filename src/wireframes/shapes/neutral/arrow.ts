/*
 * mydraft.cc
 *
 * Author: Do Duc Quan
 * Date: 26/09/2023
 * Implemented based on ./image.ts
*/

import { ConfigurableFactory, DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';
import { CommonTheme } from './_theme';

const IMAGE_URL = 'URL';
const IMAGE_ASPECT_RATIO = 'ASPECT_RATIO';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.BACKGROUND_COLOR]: 0x000000,
    [DefaultAppearance.STROKE_COLOR]: CommonTheme.CONTROL_BORDER_COLOR,
    [DefaultAppearance.STROKE_THICKNESS]: CommonTheme.CONTROL_BORDER_THICKNESS,
    [DefaultAppearance.TEXT_DISABLED]: true,
    [IMAGE_ASPECT_RATIO]: true,
    [IMAGE_URL]: '',
};

export class Arrow implements ShapePlugin {
    public identifier(): string {
        return 'Arrow';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 60, y: 40 };
    }

    public configurables(factory: ConfigurableFactory) {
        return [
            factory.text(IMAGE_URL, 'Url'),
            factory.toggle(IMAGE_ASPECT_RATIO, 'Preserve aspect ratio'),
        ];
    }

    public render(ctx: RenderContext) {
        const url = ctx.shape.getAppearance(IMAGE_URL);

        if (url) {
            const aspectRatio = ctx.shape.getAppearance(IMAGE_ASPECT_RATIO);

            ctx.renderer2.raster(url, ctx.rect, aspectRatio);
        } else {
            this.createArrow(ctx);
        }
    }

    private createArrow(ctx: RenderContext) {
        const path = 'm 56.9312 22.2158 l -14.3062 -17.6095 l 0 11.725 l -37.625 0 l 0 11.55 l 37.625 0 l 0 11.375 z';

        ctx.renderer2.path(ctx.shape, path, p => {
            p.setBackgroundColor(ctx.shape);
        });
    }
}
