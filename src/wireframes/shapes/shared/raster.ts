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
        return DiagramShape.createShape(this.identifier(), 80, 30, undefined, DEFAULT_APPEARANCE, shapeId);
    }

    protected renderInternal(ctx: AbstractContext) {
        const rasterItem = ctx.renderer.createRaster(ctx.bounds.deflate(1, 1), ctx.shape.appearance.get('SOURCE'));

        ctx.add(rasterItem);
    }
}