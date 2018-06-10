import * as svg from 'svg.js';

import {
    Color,
    Rect2,
    Vec2
} from '@app/core';

export module SVGHelper {
    export const COLOR_BLACK = new svg.Color('#000');
    export const COLOR_WHITE = new svg.Color('#fff');
    export const ZERO_POINT = new svg.Point(0, 0);
    export const IDENTITY_MATRIX = new svg.Matrix(1, 0, 0, 1, 0, 0);

    export function createSinglelineText(doc: svg.Doc, rect: Rect2, textString: string, fontSize?: number, alignment?: string) {
        return createText(doc, rect, textString, fontSize || 10, rect.height, alignment);
    }

    export function createMultilineText(doc: svg.Doc, rect: Rect2, textString: string, fontSize?: number, alignment?: string) {
        return createText(doc, rect, textString, fontSize || 10, 1.2 * (fontSize || 10), alignment);
    }

    export function createText(doc: svg.Doc, rect: Rect2, textString: string, fontSize: number, lineHeight: number, alignment?: string) {
        fontSize = fontSize || 10;

        const text = size(doc.element('foreignObject', svg.Parent), rect);

        const div = document.createElement('div');
        div.className = 'no-select';
        div.style.height = rect.height + 'px';
        div.style.lineHeight = lineHeight + 'px';
        div.style.fontSize = fontSize + 'px';
        div.style.fontFamily = 'inherit';
        div.style.overflow = 'hidden';
        div.style.textAlign = <any>alignment || 'center';
        div.textContent = textString;

        text.node.appendChild(div);

        return text;
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

    export function size<T extends svg.Element>(element: T, rect: Rect2, rotation = 0): T {
        const transform =
            new svg.Matrix()
                .rotate(
                    rotation,
                    rect.centerX,
                    rect.centerY)
                .translate(rect.x, rect.y);

        return element.matrix(transform).size(rect.size.x, rect.size.y);
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