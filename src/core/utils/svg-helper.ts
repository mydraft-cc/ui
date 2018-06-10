import * as svg from 'svg.js';

import {
    Color,
    Rect2,
    Vec2
} from '@app/core';

export interface SVGTextGroup { textElement: svg.Text; groupElement: svg.Parent; }

export module SVGHelper {
    export const COLOR_BLACK = new svg.Color('#000');
    export const COLOR_WHITE = new svg.Color('#fff');
    export const ZERO_POINT = new svg.Point(0, 0);
    export const IDENTITY_MATRIX = new svg.Matrix(1, 0, 0, 1, 0, 0);

    export function createSinglelineText(doc: svg.Doc, rect: Rect2, textString: string, fontSize?: number, alignment?: string): SVGTextGroup {
        fontSize = fontSize || 10;

        const group = size(doc.group(), rect);

        const text = group.text(textString).size(fontSize);

        let y = rect.centerY - 0.65 * fontSize * text.leading();

        if (alignment === 'left') {
            text.attr('text-anchor', 'start');
            text.center(rect.left, y);
        } else if (alignment === 'right') {
            text.attr('text-anchor', 'end');
            text.center(rect.right, y);
        } else {
            text.attr('text-anchor', 'end');
            text.center(rect.centerX, y);
        }

        // text.clipWith(size(new svg.Rect(), rect));

        return { groupElement: group, textElement: text };
    }

    export function createMultilineText(doc: svg.Doc, rectangle: Rect2, textString: string, fontSize?: number, alignment?: string): SVGTextGroup {
        return createSinglelineText(doc, rectangle, textString, fontSize, alignment);
    }

    export function createRoundedRectangleRight(doc: svg.Doc, rectangle: Rect2, radius = 10) {
        const rad = Math.min(radius, rectangle.width * 0.5, rectangle.height * 0.5);

        const t = rectangle.top;
        const l = rectangle.left;
        const r = rectangle.right;
        const b = rectangle.bottom;

        const item = doc.path(`M${l},${t} L${r - rad},${t} a${rad},${rad} 0 0 1 ${rad},${rad} L${r},${b - rad} a${rad},${rad} 0 0 1 -${rad},${rad} L${l},${b} z`);

        return item;
    }

    export function createRoundedRectangleLeft(doc: svg.Doc, rectangle: Rect2, radius = 10) {
        const rad = Math.min(radius, rectangle.width * 0.5, rectangle.height * 0.5);

        const t = rectangle.top;
        const l = rectangle.left;
        const r = rectangle.right;
        const b = rectangle.bottom;

        const item = doc.path(`M${r},${b} L${l + rad},${b} a${rad},${rad} 0 0 1 -${rad},-${rad} L${l},${t + rad} a${rad},${rad} 0 0 1 ${rad},-${rad} L${r},${t} z`);

        return item;
    }

    export function size<T extends svg.Element>(element: T, rect: Rect2): T {
        return element.size(rect.size.x, rect.size.y).center(rect.centerX, rect.centerY);
    }

    export function vec2Point(vec: Vec2): svg.Point {
        return new svg.Point(vec.x, vec.y);
    }

    export function point2Vec(point: svg.Point): Vec2 {
        return new Vec2(point.x, point.y);
    }

    export function box2Rect(box: svg.Box): Rect2 {
        return new Rect2(new Vec2(box.x, box.y), new Vec2(box.w, box.h));
    }

    export function toColor(value: string | number | Color): svg.Color {
        if (value === 'transparent') {
            return COLOR_WHITE;
        } else {
            const color = Color.fromValue(value);

            return new svg.Color({ r: color.r * 255, g: color.g * 255, b: color.b * 255 });
        }
    }
}