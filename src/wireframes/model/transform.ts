/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable no-multi-assign */

import { Rect2, Rotation, Vec2 } from '@app/core/utils';
import { Constraint } from './../interface';

const EPSILON = 0.1;

export class Transform {
    public static readonly ZERO = new Transform(Vec2.ZERO, Vec2.ZERO, Rotation.ZERO);

    private readonly computed: { aabb: Rect2 | null } = { aabb: null };

    public readonly position: Vec2;
    public readonly size: Vec2;

    public get halfSize(): Vec2 {
        return this.size.mul(0.5);
    }

    public get left() {
        return this.position.x - 0.5 * this.size.x;
    }

    public get right() {
        return this.position.x + 0.5 * this.size.x;
    }

    public get top() {
        return this.position.y - 0.5 * this.size.y;
    }

    public get bottom() {
        return this.position.y + 0.5 * this.size.y;
    }

    public get aabb(): Rect2 {
        let aabb = this.computed.aabb;

        if (aabb === null) {
            this.computed.aabb = aabb = Rect2.rotated(this.position.sub(this.size.mul(0.5)), this.size, this.rotation);
        }

        return aabb;
    }

    constructor(position: Vec2, size: Vec2,
        public readonly rotation: Rotation,
    ) {
        const hasRotation = Math.round(this.rotation.degree) > EPSILON;

        if (hasRotation) {
            this.size = size;
        } else {
            this.size = size.round();
        }

        if (hasRotation) {
            this.position = position;
        } else {
            let x = Math.floor(position.x);
            let y = Math.floor(position.y);

            if (this.size.x % 2 === 1) {
                x += 0.5;
            }
            if (this.size.y % 2 === 1) {
                y += 0.5;
            }

            this.position = new Vec2(x, y);
        }

        Object.freeze(this);
    }

    public static fromRect(rect: Rect2): Transform {
        return new Transform(new Vec2(rect.cx, rect.cy), new Vec2(rect.w, rect.h), Rotation.ZERO);
    }

    public static fromRects(rects: Rect2[]): Transform {
        return Transform.fromRect(Rect2.fromRects(rects));
    }

    public static fromJS(js: any): Transform {
        if (js.position) {
            return new Transform(new Vec2(js.position.x, js.position.y), new Vec2(js.size.x, js.size.y), Rotation.fromDegree(js.rotation));
        } else {
            return new Transform(new Vec2(js.x, js.y), new Vec2(js.w, js.h), Rotation.fromDegree(js.r));
        }
    }

    public static createFromTransformationsAndRotation(transforms: Transform[], rotation: Rotation): Transform {
        let rect: Rect2;

        if (rotation.equals(Rotation.ZERO)) {
            rect = Rect2.fromRects(transforms.map(x => x.aabb));
        } else {
            const negatedRotation = rotation.negate();

            const median = Vec2.median(...transforms.map(t => t.position));

            const unrotatedTransforms = transforms.map(t => t.rotateAroundAnchor(median, negatedRotation));
            const unrotatedBounds = Rect2.fromRects(unrotatedTransforms.map(x => x.aabb));

            const firstToCenterUnrotated = unrotatedTransforms[0].position.sub(unrotatedBounds.center);
            const firstToCenterRotated = Vec2.rotated(firstToCenterUnrotated, Vec2.ZERO, rotation);

            const center = transforms[0].position.sub(firstToCenterRotated);

            const unrotatedTransformAabbs = transforms.map(t => t.rotateAroundAnchor(center, negatedRotation).aabb);

            rect = Rect2.fromRects(unrotatedTransformAabbs);
        }

        return new Transform(new Vec2(rect.cx, rect.cy), new Vec2(rect.w, rect.h), rotation);
    }

    public equals(t: Transform) {
        return Transform.equals(this, t);
    }

    public static equals(lhs: Transform, rhs: Transform) {
        return lhs.size.equals(rhs.size) && lhs.position.equals(rhs.position) && lhs.rotation.equals(rhs.rotation);
    }

    public toString() {
        return `<position: ${this.position.toString()}, size: ${this.size.toString()}, rotation: ${this.rotation.toString()}>`;
    }

    public moveTo(position: Vec2): Transform {
        return new Transform(position, this.size, this.rotation);
    }

    public moveBy(position: Vec2): Transform {
        return new Transform(this.position.add(position), this.size, this.rotation);
    }

    public resizeTo(size: Vec2): Transform {
        return new Transform(this.position, size, this.rotation);
    }

    public resizeBy(size: Vec2): Transform {
        return new Transform(this.position, this.size.add(size), this.rotation);
    }

    public resizeAndMoveBy(size: Vec2, position: Vec2): Transform {
        return new Transform(this.position.add(position), this.size.add(size), this.rotation);
    }

    public rotateTo(rotation: Rotation): Transform {
        return new Transform(this.position, this.size, rotation);
    }

    public rotateBy(rotation: Rotation): Transform {
        return new Transform(this.position, this.size, this.rotation.add(rotation));
    }

    public rotateAroundAnchor(anchor: Vec2, rotation: Rotation): Transform {
        const newPosition = Vec2.rotated(this.position, anchor, rotation);

        return new Transform(newPosition, this.size, this.rotation.add(rotation));
    }

    public transformByBounds(oldBounds: Transform, newBounds: Transform, constraint: Constraint | undefined): Transform {
        // The ratio between new and old size.
        const ratioSize = newBounds.size.div(Vec2.max(Vec2.ONE, oldBounds.size));

        // Relative position to the old transform.
        const relativePosition = this.position.sub(oldBounds.position);

        // The center in the local coordination system of the transform.
        const localCenter = Vec2.rotated(relativePosition, Vec2.ZERO, oldBounds.rotation.negate());

        let newSize: Vec2;
        let newLocalCenter: Vec2;

        if (this.rotation.equals(oldBounds.rotation)) {
            let w = 0;
            let h = 0;

            let x = NaN;
            let y = NaN;

            if (constraint?.calculateSizeX()) {
                w = this.size.x;
            } else if (this.size.x === oldBounds.size.x) {
                w = newBounds.size.x;
            } else {
                w = Math.round(Math.max(0, this.size.x * ratioSize.x));
            }

            if (constraint?.calculateSizeY()) {
                h = this.size.y;
            } if (this.size.y === oldBounds.size.y) {
                h = newBounds.size.y;
            } else {
                h = Math.round(Math.max(0, this.size.y * ratioSize.y));
            }

            newSize = new Vec2(w, h);

            if (Math.abs(localCenter.x) < EPSILON) {
                // Center aligned.
                x = 0;
            } else if (Math.abs(this.right - oldBounds.right) < EPSILON) {
                // Right aligned.
                x = newBounds.size.x * 0.5 - w * 0.5;
            } else if (Math.abs(this.left - oldBounds.left) < EPSILON) {
                // Left aligned.
                x = -newBounds.size.x * 0.5 + w * 0.5;
            } else {
                x = localCenter.x * ratioSize.x;
            }

            if (Math.abs(localCenter.y) < EPSILON) {
                // Center aligned.
                y = 0;
            } else if (Math.abs(this.bottom - oldBounds.bottom) < EPSILON) {
                // Bottom aligned.
                y = newBounds.size.y * 0.5 - h * 0.5;
            } else if (Math.abs(this.top - oldBounds.top) < EPSILON) {
                // Top aligned.
                y = -newBounds.size.y * 0.5 + h * 0.5;
            } else {
                y = localCenter.y * ratioSize.y;
            }

            newLocalCenter = new Vec2(x, y);
        } else {
            const elementRot = this.rotation.sub(oldBounds.rotation);

            // Simplified cosinus and sinus that choose one side of the shape.
            const elementCos = elementRot.cos;
            const elementSin = elementRot.sin;

            const dx = ratioSize.x - 1;
            const dy = ratioSize.y - 1;

            // Compute the size relative to rotation of the delta rotation.
            const rotatedRatio = new Vec2(
                1 + (dx * elementCos) + (dy * elementSin),
                1 + (dx * elementSin) + (dy * elementCos));

            let w = 0;
            let h = 0;

            if (constraint?.calculateSizeX()) {
                w = this.size.x;
            } else {
                w = Math.max(0, this.size.x * rotatedRatio.x);
            }

            if (constraint?.calculateSizeY()) {
                h = this.size.y;
            } else {
                h = Math.max(0, this.size.y * ratioSize.y);
            }

            newSize = new Vec2(w, h);

            // The new center in the coordination system of the transform.
            newLocalCenter = localCenter.mul(ratioSize);
        }

        // The rotated center.
        const newCenter = Vec2.rotated(newLocalCenter, Vec2.ZERO, newBounds.rotation);

        // Absolute position.
        const newPosition = newBounds.position.add(newCenter);
        const newRotation = this.rotation.add(newBounds.rotation).sub(oldBounds.rotation);

        return new Transform(newPosition, newSize, newRotation);
    }

    public resizeTopLeft(newSize: Vec2): Transform {
        if (this.size.equals(newSize)) {
            return this;
        }

        const ratioSize = newSize.sub(this.size);

        const elementCos = Math.cos(this.rotation.radian);
        const elementSin = Math.sin(this.rotation.radian);

        const centerOffset = new Vec2(
            Math.round(0.5 * ((ratioSize.x * elementCos) + (ratioSize.y * elementSin))),
            Math.round(0.5 * ((ratioSize.x * elementSin) + (ratioSize.y * elementCos))));

        return this.resizeTo(newSize).moveBy(centerOffset);
    }

    public toJS(): any {
        return {
            x: this.position.x,
            y: this.position.y,
            w: this.size.x,
            h: this.size.y,
            r: this.rotation.degree,
        };
    }
}
