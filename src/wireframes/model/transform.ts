/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper, Rect2, Rotation, Vec2 } from '@app/core';

export class Transform {
    public static readonly ZERO = new Transform(Vec2.ZERO, Vec2.ZERO, Rotation.ZERO);

    private readonly lazy: { aabb: Rect2 | null } = { aabb: null };

    public readonly position: Vec2;
    public readonly size: Vec2;

    public get halfSize(): Vec2 {
        return this.size.mul(0.5);
    }

    public get aabb(): Rect2 {
        return this.ensureAabb();
    }

    constructor(position: Vec2, size: Vec2,
        public readonly rotation: Rotation,
    ) {
        this.size = size; // .round();

        let x = Math.floor(position.x);
        let y = Math.floor(position.y);

        if (this.size.x % 2 === 1) {
            x += 0.5;
        }
        if (this.size.y % 2 === 1) {
            y += 0.5;
        }

        this.position = new Vec2(x, y);
        this.position = position;

        Object.freeze(this);
    }

    public static fromRect(rect: Rect2): Transform {
        return new Transform(new Vec2(rect.cx, rect.cy), new Vec2(rect.w, rect.h), Rotation.ZERO);
    }

    public static fromRects(rects: Rect2[]): Transform {
        return Transform.fromRect(Rect2.fromRects(rects));
    }

    public static fromJS(js: any): Transform {
        return new Transform(new Vec2(js.position.x, js.position.y), new Vec2(js.size.x, js.size.y), Rotation.fromDegree(js.rotation));
    }

    public static createFromTransformationsAndRotations(transforms: Transform[], rotation: Rotation): Transform {
        const negatedRotation = rotation.negate();

        const median = Vec2.median(...transforms.map(t => t.position));

        const unrotatedTransforms = transforms.map(t => t.rotateAroundAnchor(median, negatedRotation));
        const unrotatedBounds = Rect2.fromRects(unrotatedTransforms.map(x => x.aabb));

        const firstToCenterUnrotated = unrotatedTransforms[0].position.sub(unrotatedBounds.center);
        const firstToCenterRotated = Vec2.rotated(firstToCenterUnrotated, Vec2.ZERO, rotation);

        const center = transforms[0].position.sub(firstToCenterRotated);

        const unrotatedTransformAabbs = transforms.map(t => t.rotateAroundAnchor(center, negatedRotation).aabb);

        const rect = Rect2.fromRects(unrotatedTransformAabbs);

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

    public transformByBounds(oldBounds: Transform, newBounds: Transform): Transform {
        // The ratio between new and old size.
        const ratioSize = newBounds.size.div(Vec2.max(Vec2.ONE, oldBounds.size));

        const oldSize = Vec2.max(Vec2.ONE, this.size);

        let newSize: Vec2;
        let newPosition: Vec2;
        let newRotation = Rotation.ZERO;

        if (oldBounds.rotation.equals(Rotation.ZERO) && newBounds.rotation.equals(Rotation.ZERO) && this.rotation.equals(Rotation.ZERO)) {
            newSize = Vec2.max(oldSize.mul(ratioSize), Vec2.ZERO).round();

            // Compute the relative center to the old bounds.
            const oldCenter = this.position.sub(oldBounds.position);

            // Compute the new relative center to the new bounds.
            const newCenter = oldCenter.mul(ratioSize);

            newPosition = newCenter.add(newBounds.position);

            let x = newPosition.x;
            let y = newPosition.y;

            let w = newSize.x;
            let h = newSize.y;

            if (this.size.x === oldBounds.size.x) {
                x = newBounds.position.x;
                w = newBounds.size.x;
            } else if (this.position.x - 0.5 * this.size.x === oldBounds.position.x - 0.5 * oldBounds.size.x) {
                // Left aligned
                x = (newBounds.position.x - 0.5 * newBounds.size.x) + 0.5 * newSize.x;
            } else if (this.position.x + 0.5 * this.size.x === oldBounds.position.x + 0.5 * oldBounds.size.x) {
                // Right aligned
                x = (newBounds.position.x + 0.5 * newBounds.size.x) - 0.5 * newSize.x;
            }

            if (this.size.y === oldBounds.size.y) {
                y = newBounds.position.y;
                h = newBounds.size.y;
            } else if (this.position.y - 0.5 * this.size.y === oldBounds.position.y - 0.5 * oldBounds.size.y) {
                // Top aligned
                y = (newBounds.position.y - 0.5 * newBounds.size.y) + 0.5 * newSize.y;
            } else if (this.position.y + 0.5 * this.size.y === oldBounds.position.y + 0.5 * oldBounds.size.y) {
                // Bottom aligned
                y = (newBounds.position.y + 0.5 * newBounds.size.y) - 0.5 * newSize.y;
            }

            newSize = new Vec2(w, h);

            newPosition = new Vec2(x, y);
        } else {
            const negatedRotation = oldBounds.rotation.negate();

            // Compute the relative center to the old bounds.
            const oldCenter = Vec2.rotated(this.position.sub(oldBounds.position), Vec2.ZERO, negatedRotation);

            const elementRot = this.rotation.sub(oldBounds.rotation);

            // Simplified cosinus and sinus that choose one side of the shape.
            const elementCos = MathHelper.simpleCos(elementRot.degree);
            const elementSin = MathHelper.simpleSin(elementRot.degree);

            // Compute the size relative to rotation of the delta rotation.
            const rotatedRatio = new Vec2(
                (ratioSize.x * elementCos) + (ratioSize.y * elementSin),
                (ratioSize.x * elementSin) + (ratioSize.y * elementCos));

            // Compute the new relative center to the new bounds.
            const newCenter = Vec2.rotated(oldCenter.mul(ratioSize), Vec2.ZERO, newBounds.rotation);

            newSize = Vec2.max(oldSize.mul(rotatedRatio), Vec2.ZERO);

            newRotation = this.rotation.add(newBounds.rotation).sub(oldBounds.rotation);
            newPosition = newCenter.add(newBounds.position);
        }

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

    private ensureAabb() {
        if (this.lazy.aabb === null) {
            this.lazy.aabb = Rect2.rotated(this.position.sub(this.size.mul(0.5)), this.size, this.rotation);

            Object.freeze(this.lazy);
        }

        return this.lazy.aabb;
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
            rotation: this.rotation.degree,
        };
    }
}
