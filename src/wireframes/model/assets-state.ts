/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Vec2 } from '@app/core';
import { ICONS_FONT_AWESOME } from './../../icons/font_awesome_unified';
import { ICONS_MATERIAL_DESIGN } from './../../icons/material_icons_unified';
import { RendererService } from './renderer.service';

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

    for (const [name, renderer] of Object.entries(rendererService.registeredRenderers)) {
        if (renderer.showInGallery()) {
            allShapes.push({ displaySearch: name.toLowerCase(), displayName: name, name, offset: renderer.previewOffset() });
        }
    }

    allShapes.sort((l, r) => l.displayName.localeCompare(r.displayName));

    return {
        shapes: allShapes,
        shapesFilter: '',
        icons: { 'Font Awesome': ICONS_FONT_AWESOME, 'Material Design': ICONS_MATERIAL_DESIGN },
        iconsFilter: '',
        iconSet: 'Font Awesome',
    };
};

export interface AssetsStateInStore {
    assets: AssetsState;
}
