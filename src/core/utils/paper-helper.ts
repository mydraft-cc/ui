import * as paper from 'paper';

import {
    Color,
    Rect2,
    Vec2
} from '@app/core';

export interface TextGroup { textItem: paper.TextItem; groupItem: paper.Group; }

export module PaperHelper {
    export const COLOR_BLACK = new paper.Color(0, 0, 0, 1);
    export const COLOR_WHITE = new paper.Color(1, 1, 1, 1);
    export const ZERO_POINT = new paper.Point(0, 0);
    export const ZERO_SIZE = new paper.Size(0, 0);
    export const ZERO_RECTANGLE = new paper.Rectangle(0, 0, 0, 0);
    export const IDENTITY_MATRIX = new paper.Matrix(1, 0, 0, 1, 0, 0);

    export function createSinglelineText(rectangle: paper.Rectangle, text: string, fontSize?: number, alignment?: string): TextGroup {
        fontSize = fontSize || 10;

        alignment = alignment || 'center';

        const clip = new paper.Path.Rectangle(rectangle);

        let y = rectangle.center.y + fontSize * 1.2 * 0.25;
        let x = rectangle.center.x;

        if (alignment === 'left') {
            x = rectangle.left;
        } else if (alignment === 'right') {
            x = rectangle.right;
        }

        x += 0.5;
        y += 0.5;

        const textItem = new paper.PointText(new paper.Point(x, y));

        textItem.content = text;
        textItem.fontSize = fontSize;
        textItem.justification = alignment;

        const groupItem = new paper.Group([clip, textItem]);

        groupItem.clipped = true;

        return { groupItem, textItem };
    }

    export function createMultilineText(rectangle: paper.Rectangle, text: string, fontSize?: number, alignment?: string): TextGroup {
        fontSize = fontSize || 10;

        alignment = alignment || 'left';

        const clip = new paper.Path.Rectangle(rectangle);

        const textItem = new paper.AreaText();

        textItem.rectangle = rectangle;
        textItem.content = text;
        textItem.fontSize = fontSize;
        textItem.justification = alignment;

        const groupItem = new paper.Group([clip, textItem]);

        groupItem.clipped = true;

        return { groupItem, textItem };
    }

    export function createRoundedRectangleRight(rectangle: paper.Rectangle, radius = 10) {
        const rad = Math.min(radius, rectangle.width * 0.5, rectangle.height * 0.5);

        const t = rectangle.top;
        const l = rectangle.left;
        const r = rectangle.right;
        const b = rectangle.bottom;

        const item = new paper.Path(`M${l},${t} L${r - rad},${t} a${rad},${rad} 0 0 1 ${rad},${rad} L${r},${b - rad} a${rad},${rad} 0 0 1 -${rad},${rad} L${l},${b} z`);

        return item;
    }

    export function createRoundedRectangleLeft(rectangle: paper.Rectangle, radius = 10) {
        const rad = Math.min(radius, rectangle.width * 0.5, rectangle.height * 0.5);

        const t = rectangle.top;
        const l = rectangle.left;
        const r = rectangle.right;
        const b = rectangle.bottom;

        const item = new paper.Path(`M${r},${b} L${l + rad},${b} a${rad},${rad} 0 0 1 -${rad},-${rad} L${l},${t + rad} a${rad},${rad} 0 0 1 ${rad},-${rad} L${r},${t} z`);

        return item;
    }

    export function vec2Point(vec: Vec2): paper.Point {
        return new paper.Point(vec.x, vec.y);
    }

    export function vec2Size(vec: Vec2): paper.Size {
        return new paper.Size(vec.x, vec.y);
    }

    export function vec2Rectangle(vec: Vec2): paper.Rectangle {
        return new paper.Rectangle(0, 0, vec.x, vec.y);
    }

    export function rect2Rectangle(rect: Rect2): paper.Rectangle {
        return new paper.Rectangle(rect.position.x, rect.position.y, rect.size.x, rect.size.y);
    }

    export function rectangle2Rect(rectangle: paper.Rectangle): Rect2 {
        return new Rect2(new Vec2(rectangle.left, rectangle.top), new Vec2(rectangle.width, rectangle.height));
    }

    export function point2Vec(point: paper.Point): Vec2 {
        return new Vec2(point.x, point.y);
    }

    export function size2Vec(size: paper.Size): Vec2 {
        return new Vec2(size.width, size.height);
    }

    export function toColor(value: any): paper.Color {
        if (value === 'transparent') {
            return new paper.Color(1, 1, 1, 0.0001);
        } else {
            const color = Color.fromValue(value);

            return new paper.Color(color.r, color.g, color.b);
        }
    }
}