/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as svg from '@svgdotjs/svg.js';
import { Color, Rect2, sizeInPx, Types } from '@app/core';
import { SvgLayer } from './layer';
import { SvgObject } from './object';

export function linkToSvg(source: SvgObject | SvgLayer, element: svg.Element) {
    // Create a reference back to the actual object.
    (element.node as any)['source'] = source;

    // And a link back to the element.
    (source as any)['element'] = element;
}

export function getElement(source: any) {
    return (source as any)['element'] as svg.Element;
}

export function getSource(element: Element) {
    return (element as any)['source'] as SvgObject | SvgLayer;
}

export interface MatrixTransform {
    x?: number;
    y?: number;

    rotation?: number;

    rx?: number;
    ry?: number;

    w?: number;
    h?: number;
}

export module SvgHelper {    
    export function roundedRectangleRight(rectangle: Rect2, radius = 10) {
        const rad = Math.min(radius, rectangle.width * 0.5, rectangle.height * 0.5);

        const t = rectangle.top;
        const l = rectangle.left;
        const r = rectangle.right;
        const b = rectangle.bottom;

        return `M${l},${t} L${r - rad},${t} a${rad},${rad} 0 0 1 ${rad},${rad} L${r},${b - rad} a${rad},${rad} 0 0 1 -${rad},${rad} L${l},${b} z`;
    }

    export function roundedRectangleLeft(rectangle: Rect2, radius = 10) {
        const rad = Math.min(radius, rectangle.width * 0.5, rectangle.height * 0.5);

        const t = rectangle.top;
        const l = rectangle.left;
        const r = rectangle.right;
        const b = rectangle.bottom;

        return `M${r},${b} L${l + rad},${b} a${rad},${rad} 0 0 1 -${rad},-${rad} L${l},${t + rad} a${rad},${rad} 0 0 1 ${rad},-${rad} L${r},${t} z`;
    }

    export function roundedRectangleTop(rectangle: Rect2, radius = 10) {
        const rad = Math.min(radius, rectangle.width * 0.5, rectangle.height * 0.5);

        const t = rectangle.top;
        const l = rectangle.left;
        const r = rectangle.right;
        const b = rectangle.bottom;

        return `M${l},${b} L${l},${t + rad} a${rad},${rad} 0 0 1 ${rad},-${rad} L${r - rad},${t} a${rad},${rad} 0 0 1 ${rad},${rad} L${r},${b} z`;
    }

    export function roundedRectangleBottom(rectangle: Rect2, radius = 10) {
        const rad = Math.min(radius, rectangle.width * 0.5, rectangle.height * 0.5);

        const t = rectangle.top;
        const l = rectangle.left;
        const r = rectangle.right;
        const b = rectangle.bottom;

        return `M${r},${t} L${r},${b - rad} a${rad},${rad} 0 0 1 -${rad},${rad} L${l + rad},${b} a${rad},${rad} 0 0 1 -${rad},-${rad} L${l},${t}z`;
    }

    export function createText(whitespace?: string, text?: string, fontSize?: number, alignment?: string, verticalAlign?: string) {
        const element = new svg.ForeignObject();
        const div = document.createElement('div');
        div.className = 'no-select';
        div.style.textAlign = alignment || 'center';
        div.style.fontFamily = 'Arial';
        div.style.fontSize = sizeInPx(fontSize || 10);
        div.style.overflow = 'hidden';
        div.style.verticalAlign = verticalAlign || 'middle';
        div.style.whiteSpace = whitespace || 'normal';
        div.textContent = text || null;

        element.node.appendChild(div);

        return element;
    }

    export function transformByRect<T extends svg.Element>(element: T, rect: Rect2, adjust = true, move = false): T {
        return transformBy(element, {
            x: rect.x,
            y: rect.y,
            w: rect.w,
            h: rect.h,
        }, adjust, move);
    }

    export function transformBy<T extends svg.Element>(element: T, t: MatrixTransform, adjust = true, move = false): T {
        let x = t.x || 0;
        let y = t.y || 0;

        let w = t.w || 0;
        let h = t.h || 0;

        const r = t.rotation || 0;

        if (adjust) {
            w = Math.round(w);
            h = Math.round(h);
        }

        if (adjust && !t.rotation) {
            x = Math.round(x);
            y = Math.round(y);
        }

        if (w > 0 && h > 0) {
            if (element.node.nodeName === 'foreignObject') {
                const text = <HTMLDivElement>element.node.children[0];

                if (text.style.verticalAlign === 'middle') {
                    text.style.lineHeight = sizeInPx(h);
                } else {
                    text.style.lineHeight = '1.5';
                }

                text.style.height = sizeInPx(h);
            }

            if (element.node.nodeName === 'ellipse') {
                fastSetAttribute(element.node, 'cx', w * 0.5);
                fastSetAttribute(element.node, 'cy', h * 0.5);
                fastSetAttribute(element.node, 'rx', w * 0.5);
                fastSetAttribute(element.node, 'ry', h * 0.5);
            } else {
                setSize(element, w, h);
            }
        }

        let matrix = new svg.Matrix();

        if (r !== 0) {
            matrix.rotateO(r, t.rx || (x + 0.5 * w), t.ry || (y + 0.5 * h));
        }

        if (move) {
            element.matrix(matrix);

            if (x !== 0 || y !== 0) {
                element.move(x, y);
            }
        } else {
            if (x !== 0 || y !== 0) {
                // Use the alternative methods with O to not create a new matrix.
                matrix = matrix.multiplyO(new svg.Matrix().translateO(x, y));
            }

            element.matrix(matrix);
        }

        return element;
    }

    export function setPosition(element: svg.Element, x: number, y: number) {
        element.matrix(new svg.Matrix().translateO(x, y));
    }

    export function setSize(element: svg.Element, width: number, height: number) {
        fastSetAttribute(element.node, 'width', width);
        fastSetAttribute(element.node, 'height', height);
    }

    export function fastSetAttribute(element: Element, name: string, value: any) {
        const attrs: { [key: string]: any } = (element as any)['__attrs'] ||= {};

        if (attrs[name] === value) {
            return;
        }

        attrs[name] = value;
        setAttribute(element, name, value);
    }

    export function setAttribute(element: Element, name: string, value: any) {
        if (value === null) {
            element.removeAttribute(name);
            return;
        }

        const type = typeof value;

        switch (type) {
            case 'undefined':
                element.removeAttribute(name);
                break;
            case 'number':
                element.setAttribute(name, value.toString());
                break;
            case 'string':
                element.setAttribute(name, value);
                break;
            default:
                throw new Error('Not supported.');
        }
    }

    export function toColor(value: string | number | Color | null | undefined): string {
        if (Types.isString(value)) {
            return value;
        } else if (value) {
            return Color.fromValue(value).toString();
        } else {
            return 'black';
        }
    }
}
