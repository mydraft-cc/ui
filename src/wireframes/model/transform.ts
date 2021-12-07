/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rect2, Vec2 } from '@app/core';

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
        return new Transform(new Vec2(js.position.x, js.position.y), new Vec2(js.size.x, js.size.y));
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

    public transformByBounds(oldBounds: Transform, newBounds: Transform): Transform {
        // The ratio between new and old size.
        const ratioSize = newBounds.size.div(Vec2.max(Vec2.ONE, oldBounds.size));

        const oldSize = Vec2.max(Vec2.ONE, this.size);

        // Compute the relative center to the old bounds.
        const oldCenter = this.position.sub(oldBounds.position);

        // Compute the size relative to the size diff.
        const newSize = Vec2.max(oldSize.mul(ratioSize), Vec2.ZERO);

        // Compute the new relative center to the new bounds.
        const newCenter = oldCenter.mul(ratioSize);

        return new Transform(newCenter.add(newBounds.position), newSize);
    }

    public toJS(): any {
        return {
            position: {
                x: this.position.x,
                y: this.position.y,
            },
            size: {
                x: this.size.x,
                y: this.size.y,
            },
        };
    }
}
