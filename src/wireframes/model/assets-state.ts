import { Vec2 } from '@app/core';

import { RendererService } from './renderer.service';

import { ICONS_FONT_AWESOME } from './../../icons/font_awesome_unified';
import { ICONS_MATERIAL_DESIGN } from './../../icons/material_icons_unified';

export interface AssetInfo {
    name: string;

    displayName: string;

    displaySearch: string;
}

export interface ShapeInfo extends AssetInfo {
    offset: Vec2;
}

export interface IconInfo extends AssetInfo {
    text: string;

    fontFamily: string;

    fontClass: string;
}

export interface AssetsState {
    icons: { [name: string]: IconInfo[] };

    iconSet: string;

    iconsFilter: string;

    shapes: ShapeInfo[];

    shapesFilter: string;
}

export const createInitialAssetsState: (rendererService: RendererService) => AssetsState = (rendererService: RendererService) => {
    const allShapes: ShapeInfo[] = [];

    for (let rendererKey in rendererService.registeredRenderers) {
        if (rendererService.registeredRenderers.hasOwnProperty(rendererKey)) {
            const renderer = rendererService.registeredRenderers[rendererKey];

            if (renderer.showInGallery()) {
                allShapes.push({ displaySearch: rendererKey.toLowerCase(), displayName: rendererKey, name: rendererKey, offset: renderer.previewOffset() });
            }
        }
    }

    allShapes.sort((l, r) => l.displayName.localeCompare(r.displayName));

    return {
        shapes: allShapes,
        shapesFilter: '',
        icons: { 'Font Awesome': ICONS_FONT_AWESOME, 'Material Design': ICONS_MATERIAL_DESIGN },
        iconsFilter: '',
        iconSet: 'Font Awesome'
    };
};

export interface AssetsStateInStore {
    assets: AssetsState;
}