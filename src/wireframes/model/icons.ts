import { FONT_AWESOME } from './../../icons/font-awesome';

interface IconInfo {
    label: string;
    text: string;
    term: string;
    name: string;
}

export const ICONS: IconInfo[] = [];

for (let icon of FONT_AWESOME.icons) {
    let term = icon.id;

    if (icon.filter) {
        for (let filter of icon.filter) {
            term += ' ';
            term += filter;
        }
    }

    ICONS.push({
        label: icon.id || icon.name,
        term: term,
        text: String.fromCharCode(parseInt(icon.unicode, 16)),
        name: icon.id
    });
}

ICONS.sort((l, r) => l.name.localeCompare(r.name));