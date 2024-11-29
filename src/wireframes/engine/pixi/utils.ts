/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Container, Graphics } from 'pixi.js';
import { Color, Rect2, Types } from '@app/core';
import { PixiLayer } from './layer';
import { PixiObject } from './object';

export function linkToPixi(source: PixiObject | PixiLayer, element: Container) {
    // Create a reference back to the actual object.
    (element as any)['source'] = source;

    // And a link back to the element.
    (source as any)['element'] = element;
}

export function getContainer(source: PixiObject) {
    return (source as any)['element'] as Container;
}

export function getSource(element: Container) {
    return (element as any)['source'] as PixiObject | PixiLayer;
}

export module PixiHelper {    
    export function roundedRectangleRight(g: Graphics, rectangle: Rect2, radius = 10) {
        const rad = Math.min(radius, rectangle.width * 0.5, rectangle.height * 0.5);

        const t = rectangle.top;
        const l = rectangle.left;
        const r = rectangle.right;
        const b = rectangle.bottom;
        
        g.moveTo(l, t);
        g.lineTo(r - rad, t);
        g.arcToSvg(rad, rad, 0, 0, 1, r, t + rad);
        g.lineTo(r, b - rad);
        g.arcToSvg(rad, rad, 0, 0, 1, r - rad, b);
        g.lineTo(l, b);
        g.closePath();
    }

    export function roundedRectangleLeft(g: Graphics, rectangle: Rect2, radius = 10) {
        const rad = Math.min(radius, rectangle.width * 0.5, rectangle.height * 0.5);

        const t = rectangle.top;
        const l = rectangle.left;
        const r = rectangle.right;
        const b = rectangle.bottom;
        
        g.moveTo(r, b);
        g.lineTo(l + rad, b);
        g.arcToSvg(rad, rad, 1, 0, 1, l, b - rad);
        g.lineTo(l, t + rad);
        g.arcToSvg(rad, rad, 1, 0, 1, l + rad, t);
        g.lineTo(r, t);
        g.closePath();
    }

    export function roundedRectangleTop(g: Graphics, rectangle: Rect2, radius = 10) {
        const rad = Math.min(radius, rectangle.width * 0.5, rectangle.height * 0.5);

        const t = rectangle.top;
        const l = rectangle.left;
        const r = rectangle.right;
        const b = rectangle.bottom;
        
        g.moveTo(l, b);
        g.lineTo(l, t + rad);
        g.arcToSvg(rad, rad, 0, 0, 1, l + rad, t);
        g.lineTo(r - rad, t);
        g.arcToSvg(rad, rad, 0, 0, 1, r, t + rad);
        g.lineTo(r, b);
        g.closePath();
    }

    export function roundedRectangleBottom(g: Graphics, rectangle: Rect2, radius = 10) {
        const rad = Math.min(radius, rectangle.width * 0.5, rectangle.height * 0.5);

        const t = rectangle.top;
        const l = rectangle.left;
        const r = rectangle.right;
        const b = rectangle.bottom;
        
        g.moveTo(r, t);
        g.lineTo(r, b - rad);
        g.arcToSvg(rad, rad, 0, 0, 1, r - rad, b);
        g.lineTo(l + rad, b);
        g.arcToSvg(rad, rad, 0, 0, 1, l, b - rad);
        g.lineTo(l, t);
        g.closePath();
    }

    export function toColor(value: string | number | Color | null | undefined): string {
        if (value === 'none') {
            return 'transparent';
        }
        
        if (Types.isString(value)) {
            return value;
        } else if (value) {
            return Color.fromValue(value).toString();
        } else {
            return 'black';
        }
    }
}