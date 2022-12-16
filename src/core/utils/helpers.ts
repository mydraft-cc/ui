/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

const IS_MAC = window.navigator?.userAgent?.indexOf('Mac') >= 0;

export function isMac() {
    return IS_MAC;
}

export function isModKey(key: KeyboardEvent | MouseEvent) {
    if (isMac()) {
        return key.metaKey;
    } else {
        return key.ctrlKey;
    }
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