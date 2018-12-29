import { ICONS } from './font-awesome';

export const ICONS_FONT_AWESOME = ICONS.icons.map(icon => {
    const text = String.fromCharCode(parseInt(icon.unicode, 16));

    let searchTerm = icon.id;

    if (icon.filter) {
        for (let filter of icon.filter) {
            searchTerm += ' ';
            searchTerm += filter;
        }
    }

    const label = icon.id || icon.name;

    return { label, text, searchTerm, name: icon.id, fontClass: 'fa', fontFamily: 'FontAwesome' };
}).sort((l, r) => l.label.localeCompare(r.label));