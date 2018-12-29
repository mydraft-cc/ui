import { ICONS } from './material_icons';

export const ICONS_MATERIAL_DESIGN = ICONS.map(icon => {
    const parts = icon.trim().split(' ');

    const text = String.fromCharCode(parseInt(parts[1], 16));
    const name = parts[0];

    return { label: name, text, searchTerm: name, name, fontClass: 'material-icons', fontFamily: 'Material Icons' };
}).filter(x => x.name.length > 0);