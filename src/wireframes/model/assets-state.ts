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
    // The name of the asset.
    name: string;

    // The display name.
    displayName: string;
}

export interface ShapeInfo extends AssetInfo {
    // The offset when copy / paste.
    offset: Vec2;
}

export interface IconInfo extends AssetInfo {
    // The name of the icon.
    text: string;

    // The font family.
    fontFamily: string;

    // The font class.
    fontClass: string;
}

export interface AssetsState {
    // The icons by name.
    icons: { [name: string]: IconInfo[] };

    // The icon set.
    iconSet: string;

    // The icon filter,
    iconsFilter: string;

    // The shapes to show.
    shapes: ShapeInfo[];

    // The shapes filter.
    shapesFilter: string;
}

export const createInitialAssetsState: (rendererService: RendererService) => AssetsState = (rendererService: RendererService) => {
    const allShapes: ShapeInfo[] = [];

    for (const [name, renderer] of Object.entries(rendererService.registeredRenderers)) {
        if (renderer.showInGallery()) {
            allShapes.push({ displayName: name, name, offset: renderer.previewOffset() });
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
