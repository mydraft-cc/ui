import { ICONS, RendererService } from '@app/wireframes/model';

export interface ShapeInfo {
    name: string;

    nameLower: string;
}

export interface IconInfo {
    key: string;

    char: string;
}

export interface AssetsState {
    icons: IconInfo[];

    iconsFilter: string;

    iconsFiltered: IconInfo[];

    shapes: ShapeInfo[];

    shapesFilter: string;

    shapesFiltered: ShapeInfo[];
}

export const createInitialAssetsState: (rendererService: RendererService) => AssetsState = (rendererService: RendererService) => {
    const allShapes: ShapeInfo[] = [];

    for (let rendererKey in rendererService.registeredRenderers) {
        if (rendererService.registeredRenderers.hasOwnProperty(rendererKey)) {
            const renderer = rendererService.registeredRenderers[rendererKey];

            if (renderer.showInGallery()) {
                allShapes.push({
                    nameLower: rendererKey.toLowerCase(),
                    name: rendererKey
                });
            }
        }
    }

    return {
        shapes: allShapes,
        shapesFilter: '',
        shapesFiltered: allShapes,
        icons: ICONS,
        iconsFilter: '',
        iconsFiltered: ICONS
    };
};