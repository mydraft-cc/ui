/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ICONS } from './material_icons';

export const ICONS_MATERIAL_DESIGN = ICONS.map(icon => {
    const parts = icon.trim().split(' ');

    const text = String.fromCharCode(parseInt(parts[1], 16));

    return {
        displayName: parts[0],
        displaySearch: parts[0],
        fontClass: 'material-icons',
        fontFamily: 'Material Icons',
        name: `mat-${text}`,
        text,
    };
}).filter(x => x.name.length > 0);
