/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DefaultAppearance, RenderContext, ShapePlugin } from '@app/wireframes/interface';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DefaultAppearance.TEXT_DISABLED] = true;

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

    public showInGallery() {
        return false;
    }

    public render(ctx: RenderContext) {
        ctx.renderer2.raster(ctx.shape.getAppearance('SOURCE'), ctx.rect, true);
    }
}
