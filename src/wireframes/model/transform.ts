/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rect2, Vec2 } from '@app/core';
import { Constraint } from '.';

export class Transform {
    public static readonly ZERO = new Transform(Vec2.ZERO, Vec2.ZERO);

    public get halfSize(): Vec2 {
        return this.size.mul(0.5);
    }

    public get aabb(): Rect2 {
        return new Rect2(this.position.x, this.position.y, this.size.x, this.size.y);
    }

    public readonly position: Vec2;
    public readonly size: Vec2;

    constructor(position: Vec2, size: Vec2) {
        this.position = new Vec2(
            Math.round(position.x),
            Math.round(position.y),
        );

        this.size = new Vec2(
            Math.round(size.x),
            Math.round(size.y),
        );

        Object.freeze(this);
    }

    public static fromRect(rect: Rect2): Transform {
        return new Transform(new Vec2(rect.x, rect.y), new Vec2(rect.w, rect.h));
    }

    public static fromRects(rects: Rect2[]): Transform {
        return Transform.fromRect(Rect2.fromRects(rects));
    }

    public static createFromTransforms(transforms: Transform[]): Transform {
        return Transform.fromRects(transforms.map(x => x.aabb));
    }

    public static fromJS(js: any): Transform {
        return new Transform(
            new Vec2(
                js.position.x - 0.5 * js.size.x,
                js.position.y - 0.5 * js.size.y),
            new Vec2(
                js.size.x,
                js.size.y));
    }

    public static equals(lhs: Transform, rhs: Transform) {
        return lhs.size.equals(rhs.size) && lhs.position.equals(rhs.position);
    }

    public equals(t: Transform) {
        return Transform.equals(this, t);
    }

    public toString() {
        return `<position: ${this.position.toString()}, size: ${this.size.toString()}>`;
    }

    public moveTo(position: Vec2): Transform {
        return new Transform(position, this.size);
    }

    public moveBy(position: Vec2): Transform {
        return new Transform(this.position.add(position), this.size);
    }

    public resizeTo(size: Vec2): Transform {
        return new Transform(this.position, size);
    }

    public resizeBy(size: Vec2): Transform {
        return new Transform(this.position, this.size.add(size));
    }

    public resizeAndMoveBy(size: Vec2, position: Vec2): Transform {
        return new Transform(this.position.add(position), this.size.add(size));
    }

    public transformByBounds(oldBounds: Transform, newBounds: Transform, constraint?: Constraint): Transform {
        let w = 0;
        let h = 0;

        let x = 0;
        let y = 0;

        // The ratio between new and old size.
        const ratioSize = newBounds.size.div(Vec2.max(Vec2.ONE, oldBounds.size));

        if (constraint?.calculateSizeX()) {
            w = this.size.x;
        } else if (this.size.x === oldBounds.size.x) {
            w = newBounds.size.x;
        } else {
            w = Math.max(0, this.size.x * ratioSize.x);
        }

        if (constraint?.calculateSizeY()) {
            h = this.size.y;
        } if (this.size.y === oldBounds.size.y) {
            h = newBounds.size.y;
        } else {
            h = Math.max(0, this.size.y * ratioSize.y);
        }

        if (this.position.x === oldBounds.position.x) {
            // Left aligned.
            x = newBounds.position.x;
        } else if (this.position.x + this.size.x === oldBounds.position.x + oldBounds.size.x) {
            // Right aligned.
            x = newBounds.position.x + newBounds.size.x - w;
        } else {
            const relativeX = this.position.x - oldBounds.position.x;

            x = newBounds.position.x + relativeX * ratioSize.x;
        }

        if (this.position.y === oldBounds.position.y) {
            // Top aligned.
            y = newBounds.position.y;
        } else if (this.position.y + this.size.y === oldBounds.position.y + oldBounds.size.y) {
            // Bottom aligned.
            y = newBounds.position.y + newBounds.size.y - h;
        } else {
            const relativeY = this.position.y - oldBounds.position.y;

            y = newBounds.position.y + relativeY * ratioSize.y;
        }

        return new Transform(new Vec2(x, y), new Vec2(w, h));
    }

    public toJS(): any {
        return {
            position: {
                x: this.position.x + 0.5 * this.size.x,
                y: this.position.y + 0.5 * this.size.y,
            },
            size: {
                x: this.size.x,
                y: this.size.y,
            },
        };
    }
}
