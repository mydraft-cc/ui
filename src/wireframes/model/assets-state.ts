import { ICONS, RendererService } from '@app/wireframes/model';

export interface ShapeInfo {
    label: string;
    name: string;
}

export interface IconInfo {
    label: string;
    text: string;
    term: string;
    name: string;
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
                    name: rendererKey.toLowerCase(),
                    label: rendererKey
                });
            }
        }
    }

    allShapes.sort((l, r) => l.name.localeCompare(r.name));

    return {
        shapes: allShapes,
        shapesFilter: '',
        shapesFiltered: allShapes,
        icons: ICONS,
        iconsFilter: '',
        iconsFiltered: ICONS
    };
};