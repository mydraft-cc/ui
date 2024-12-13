/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Types } from '@app/core';
import { RendererColor, RendererWidth, Shape, TextConfig } from '@app/wireframes/interface';

export const ROTATION_CONFIG = [
    { angle: 45, cursor: 'ne-resize' },
    { angle: 90, cursor: 'e-resize' },
    { angle: 135, cursor: 'se-resize' },
    { angle: 180, cursor: 's-resize' },
    { angle: 215, cursor: 'sw-resize' },
    { angle: 270, cursor: 'w-resize' },
    { angle: 315, cursor: 'nw-resize' },
];

export function getBackgroundColor(value: RendererColor | null | undefined) {
    if (isShape(value)) {
        return value.backgroundColor;
    } else {
        return value;
    }
}

export function getForegroundColor(value: RendererColor | null | undefined) {
    if (isShape(value)) {
        return value.foregroundColor;
    } else {
        return value;
    }
}

export function getStrokeColor(value: RendererColor | null | undefined) {
    if (isShape(value)) {
        return value.strokeColor;
    } else {
        return value;
    }
}

export function getStrokeWidth(value: RendererWidth | null | null | undefined) {
    if (isShape(value)) {
        return value.strokeThickness;
    } else {
        return value || 0;
    }
}

export function getText(value: TextConfig | Shape | string | null | undefined) {
    let text: any = undefined;
    if (isShape(value)) {
        text = value.text;
    } else if (Types.isObject(value)) {
        text = (value as any)['text'];
    } else {
        text = value;
    }
    
    if (!Types.isString(text)) {
        return '';
    }

    return text;
}

export function getTextAlignment(value: TextConfig | Shape | string | null | undefined) {
    let alignment: any = undefined;
    if (isShape(value)) {
        alignment = value.textAlignment;
    } else if (Types.isObject(value)) {
        alignment = (value as any)['alignment'];
    } else {
        alignment = value;
    }
    
    if (!Types.isString(alignment)) {
        return 'center';
    }

    return alignment;
}

export function getFontSize(value: TextConfig | Shape | number | null | undefined): number {
    let fontSize: any = undefined;
    if (isShape(value)) {
        fontSize = value.fontSize;
    } else if (Types.isObject(value)) {
        fontSize = (value as any)['fontSize'];
    } else {
        fontSize = value;
    }

    if (!Number.isFinite(fontSize)) {
        return 16;
    }

    return fontSize;
}

export function getFontFamily(value: TextConfig | Shape | string | null | undefined) {
    let fontFamily: any = undefined;
    if (isShape(value)) {
        fontFamily = value.fontSize;
    } else if (Types.isObject(value)) {
        fontFamily = (value as any)['fontFamily'];
    } else {
        fontFamily = value;
    }
    
    if (!Types.isString(fontFamily)) {
        return 'Arial';
    }

    return fontFamily;
}

export function getOpacity(value: RendererWidth | null | undefined) {
    let opacity: any;
    if (isShape(value)) {
        opacity = value.opacity;
    } else {
        opacity = value;
    }

    if (!Number.isFinite(opacity)) {
        opacity = 1;
    }

    return opacity;
}

function isShape(element: any): element is Shape {
    return Types.isFunction(element?.getAppearance);
}

export function setValue<T>(element: any, key: string, value: T) {
    (element as any)[key] = value;
}

export function getValue<T>(element: any, key: string, factory?: () => T): T {
    let value = (element as any)[key];
    if (!value && factory) {
        value = factory();
        (element as any)[key] = value;
    }

    return value;
}