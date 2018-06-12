import { DiagramShape } from '@app/wireframes/model';

import { AbstractContext, AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';

const DEFAULT_APPEARANCE = {};
DEFAULT_APPEARANCE[DiagramShape.APPEARANCE_TEXT_DISABLED] = true;

export class Raster extends AbstractControl {
    public identifier(): string {
        return 'Raster';
    }

    public showInGallery() {
        return false;
    }

    public createDefaultShape(shapeId: string): DiagramShape {
        return DiagramShape.createShape(shapeId, this.identifier(), 80, 30, undefined, DEFAULT_APPEARANCE);
    }

    protected renderInternal(ctx: AbstractContext) {
        const rasterItem = ctx.renderer.createRaster(ctx.shape.appearance.get('SOURCE'), ctx.bounds.deflate(1));

        ctx.add(rasterItem);
    }
}