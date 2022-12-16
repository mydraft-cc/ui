/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, RenderContext, ShapePlugin, VisualSource } from '@app/wireframes/interface';

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

    public create(source: VisualSource) {
        if (source.type == 'Image') {
            let { width, height, source: data } = source.image;

            if (width > MAX_IMAGE_SIZE || height > MAX_IMAGE_SIZE) {
                const ratio = width / height;

                if (ratio > 1) {
                    width = MAX_IMAGE_SIZE;

                    height = MAX_IMAGE_SIZE / ratio;
                } else {
                    height = MAX_IMAGE_SIZE;
                    
                    width = MAX_IMAGE_SIZE * ratio;
                }
            }

            return { width, height, appearance: { [SOURCE]: data } };
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
