import { ICONS } from './font-awesome';

export const ICONS_FONT_AWESOME = ICONS.icons.map(icon => {
    const text = String.fromCharCode(parseInt(icon.unicode, 16));

    let displaySearch = icon.id;

    if (icon.filter) {
        for (let filter of icon.filter) {
            displaySearch += ' ';
            displaySearch += filter;
        }
    }

    const displayName = icon.id || icon.name;

    return { displayName, text, displaySearch, name: `fa-${text}`, fontClass: 'fa', fontFamily: 'FontAwesome' };
}).sort((l, r) => l.displayName.localeCompare(r.displayName));