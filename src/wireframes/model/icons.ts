import { FONT_AWESOME } from './../../icons/font-awesome';

interface IconInfo {
    text: string;

    name: string;

    label: string;

    searchTerm: string;
}

export const ICONS_FONT_AWESOME: IconInfo[] = [];

for (let icon of FONT_AWESOME.icons) {
    const text = String.fromCharCode(parseInt(icon.unicode, 16));

    let searchTerm = icon.id;

    if (icon.filter) {
        for (let filter of icon.filter) {
            searchTerm += ' ';
            searchTerm += filter;
        }
    }

    const label = icon.id || icon.name;

    ICONS_FONT_AWESOME.push({ label, text, searchTerm, name: icon.id });
}

ICONS_FONT_AWESOME.sort((l, r) => l.label.localeCompare(r.label));