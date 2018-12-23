
import { Vec2 } from '@app/core';

import { RendererService } from './renderer.service';

import { ICONS_FONT_AWESOME } from './icons';

export interface AssetInfo {
    label: string;

    searchTerm: string;
}

export interface ShapeInfo extends AssetInfo {
    offset: Vec2;

    key: string;
}

export interface IconInfo extends AssetInfo {
    text: string;

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
                allShapes.push({ searchTerm: rendererKey.toLowerCase(), label: rendererKey, key: rendererKey, offset: renderer.previewOffset() });
            }
        }
    }

    allShapes.sort((l, r) => l.label.localeCompare(r.label));

    return {
        shapes: allShapes,
        shapesFilter: '',
        shapesFiltered: allShapes,
        icons: ICONS_FONT_AWESOME,
        iconsFilter: '',
        iconsFiltered: ICONS_FONT_AWESOME
    };
};