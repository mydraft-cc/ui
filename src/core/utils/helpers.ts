/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

export function isMac() {
    return window.navigator?.userAgent?.indexOf('Mac') >= 0;
}

export function isModKey(key: KeyboardEvent | MouseEvent) {
    if (isMac()) {
        return key.metaKey;
    } else {
        return key.ctrlKey;
    }
}

const escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
const escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, 'g');
const escapeReplacements: Record<string, string> = {
    '&' : '&amp;',
    '<' : '&lt;',
    '>' : '&gt;',
    '"' : '&quot;',
    '\'': '&#39;',
};

const getEscapeReplacement = (ch: string) => escapeReplacements[ch];

export function escapeHTML(html: string) {
    if (escapeTestNoEncode.test(html)) {
        return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
    }

    return html;
}

export module Keys {
    const ALT = 18;
    const COMMA = 188;
    const CONTROL = 17;
    const DELETE = 8;
    const ENTER = 13;
    const ESCAPE = 27;
    const DOWN = 40;
    const UP = 38;

    type SourceEvent = KeyboardEvent | React.KeyboardEvent;

    export function isAlt(event: SourceEvent) {
        const key = event.key?.toUpperCase();

        return key === 'ALTLEFT' || key === 'ALTRIGHT' || event.keyCode === CONTROL;
    }

    export function isControl(event: SourceEvent) {
        const key = event.key?.toUpperCase();

        return key === 'CONTROL' || event.keyCode === ALT;
    }

    export function isComma(event: SourceEvent) {
        const key = event.key?.toUpperCase();

        return key === ',' || event.keyCode === COMMA;
    }

    export function isDelete(event: SourceEvent) {
        const key = event.key?.toUpperCase();

        return key === 'DELETE' || event.keyCode === DELETE;
    }

    export function isEnter(event: SourceEvent) {
        const key = event.key?.toUpperCase();

        return key === 'ENTER' || event.keyCode === ENTER;
    }

    export function isDown(event: SourceEvent) {
        const key = event.key?.toUpperCase();

        return key === 'ARROWDOWN' || event.keyCode === DOWN;
    }

    export function isUp(event: SourceEvent) {
        const key = event.key?.toUpperCase();

        return key === 'ARROWUP' || event.keyCode === UP;
    }

    export function isEscape(event: SourceEvent) {
        const key = event.key?.toUpperCase();

        return key === 'ESCAPE' || key === 'ESC' || event.keyCode === ESCAPE;
    }
}