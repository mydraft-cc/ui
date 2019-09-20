import * as svg from 'svg.js';

import { Color } from './color';

import { sizeInPx } from './react';

import { Rect2 } from './rect2';

import { Vec2 } from './vec2';

export interface MatrixTransform {
    rect?: Rect2;

    x?: number;
    y?: number;

    rotation?: number;

    rx?: number;
    ry?: number;

    w?: number;
    h?: number;
}

export module SVGHelper {
    export const COLOR_BLACK = new svg.Color('#000');
    export const COLOR_WHITE = new svg.Color('#fff');
    export const ZERO_POINT = new svg.Point(0, 0);
    export const IDENTITY_MATRIX = new svg.Matrix(1, 0, 0, 1, 0, 0);

    export function createSinglelineText(container: svg.Container, text: string, fontSize?: number, alignment?: string) {
        return createText(container, text, fontSize, alignment, 'middle');
    }

    export function createMultilineText(container: svg.Container, text: string, fontSize?: number, alignment?: string) {
        return createText(container, text, fontSize, alignment, 'top');
    }

    export function createText(container: svg.Container, text: string, fontSize?: number, alignment?: string, verticalAlign?: string) {
        fontSize = fontSize || 10;

        const element = container.element('foreignObject', svg.Parent);

        const div = document.createElement('div');
        div.className = 'no-select';
        div.style.textAlign = alignment || 'center';
        div.style.fontSize = sizeInPx(fontSize || 10);
        div.style.fontFamily = 'inherit';
        div.style.overflow = 'hidden';
        div.style.verticalAlign = verticalAlign || 'middle';
        div.textContent = text;

        element.node.appendChild(div);

        return element;
    }

    export function createRoundedRectangleRight(container: svg.Container, rectangle: Rect2, radius = 10) {
        const rad = Math.min(radius, rectangle.width * 0.5, rectangle.height * 0.5);

        const t = rectangle.top;
        const l = rectangle.left;
        const r = rectangle.right;
        const b = rectangle.bottom;

        const item = container.path(`M${l},${t} L${r - rad},${t} a${rad},${rad} 0 0 1 ${rad},${rad} L${r},${b - rad} a${rad},${rad} 0 0 1 -${rad},${rad} L${l},${b} z`);

        return item;
    }

    export function createRoundedRectangleLeft(container: svg.Container, rectangle: Rect2, radius = 10) {
        const rad = Math.min(radius, rectangle.width * 0.5, rectangle.height * 0.5);

        const t = rectangle.top;
        const l = rectangle.left;
        const r = rectangle.right;
        const b = rectangle.bottom;

        const item = container.path(`M${r},${b} L${l + rad},${b} a${rad},${rad} 0 0 1 -${rad},-${rad} L${l},${t + rad} a${rad},${rad} 0 0 1 ${rad},-${rad} L${r},${t} z`);

        return item;
    }

    export function transform<T extends svg.Element>(element: T, t: MatrixTransform): T {
        let x = Math.round(t.rect ? t.rect.x : t.x || 0);
        let y = Math.round(t.rect ? t.rect.y : t.y || 0);

        let w = Math.round(t.rect ? t.rect.width  : t.w || 0);
        let h = Math.round(t.rect ? t.rect.height : t.h || 0);

        if (element.attr('stroke-width') % 2 === 1) {
            x += 0.5;
            y += 0.5;
            w -= 1;
            h -= 1;
        }

        let matrix =
            new svg.Matrix()
                .rotate(
                    t.rotation || 0,
                    t.rx || (x + 0.5 * w),
                    t.ry || (y + 0.5 * h)
                );

        if (element['children']) {
            if (t.rect || t.x || t.y) {
                matrix = matrix || new svg.Matrix();
                matrix = matrix.translate(x, y);
            }

            if (matrix) {
                element.matrix(matrix);
            }
        } else {
            if (matrix) {
                element.matrix(matrix);
            }

            if (t.rect || t.x || t.y) {
                element.move(x, y);
            }
        }

        if ((t.rect || t.w || t.h) && w > 0 && h > 0) {
            if (element.node.nodeName === 'foreignObject') {
                const text = <HTMLDivElement>element.node.children[0];

                if (text.style.verticalAlign === 'middle') {
                    text.style.lineHeight = sizeInPx(h);
                }

                text.style.height = sizeInPx(h);
            }

            element.size(w, h);
        }

        return element;
    }

    export function vec2Point(vec: Vec2): svg.Point {
        return new svg.Point(vec.x, vec.y);
    }

    export function point2Vec(point: svg.Point): Vec2 {
        return new Vec2(point.x, point.y);
    }

    export function box2Rect(box: svg.Box): Rect2 {
        return new Rect2(box.x, box.y, box.w, box.h);
    }

    export function toColor(value: string | number | Color): string {
        if (value === 'transparent') {
            return 'transparent';
        } else if (value === 'none') {
            return 'none';
        } else if (value) {
            const color = Color.fromValue(value);

            return new svg.Color({ r: color.r * 255, g: color.g * 255, b: color.b * 255 }).toHex();
        } else {
            return 'black';
        }
    }
}