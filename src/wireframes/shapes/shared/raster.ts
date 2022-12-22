/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, RenderContext, ShapePlugin, ShapeSource } from '@app/wireframes/interface';

const MAX_IMAGE_SIZE = 300;
const SOURCE = 'SOURCE';

const DEFAULT_APPEARANCE = {
    [DefaultAppearance.TEXT_DISABLED]: true,
};

export class Raster implements ShapePlugin {
    public identifier(): string {
        return 'Raster';
    }

    public defaultAppearance() {
        return DEFAULT_APPEARANCE;
    }

    public defaultSize() {
        return { x: 80, y: 30 };
    }

    public create(source: ShapeSource) {
        if (source.type == 'Image') {
            let { width: w, height: h, source: data } = source.image;

            if (w > MAX_IMAGE_SIZE || h > MAX_IMAGE_SIZE) {
                const ratio = w / h;

                if (ratio > 1) {
                    w = MAX_IMAGE_SIZE;
                    h = MAX_IMAGE_SIZE / ratio;
                } else {
                    h = MAX_IMAGE_SIZE;
                    w = MAX_IMAGE_SIZE * ratio;
                }
            }

            return { 
                renderer: this.identifier(),
                size: {
                    x: w,
                    y: h,
                }, 
                appearance: { 
                    [SOURCE]: data,
                },
            };
        }

        return null;
    }

    public showInGallery() {
        return false;
    }

    public render(ctx: RenderContext) {
        ctx.renderer2.raster(ctx.shape.getAppearance(SOURCE), ctx.rect, true);
    }
}
