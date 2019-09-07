import {
    MathHelper,
    Rect2,
    Rotation,
    Vec2
} from '@app/core';

export class Transform {
    public static readonly ZERO = new Transform(Vec2.ZERO, Vec2.ZERO, Rotation.ZERO);

    private readonly lazy: { aabb: Rect2 | null } = { aabb: null };

    public get halfSize(): Vec2 {
        return this.size.mul(0.5);
    }

    public get aabb(): Rect2 {
        return this.ensureAabb();
    }

    constructor(
        public readonly position: Vec2,
        public readonly size: Vec2,
        public readonly rotation: Rotation
    ) {
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
        const negatedRotation = oldBounds.rotation.negate();

        const ratioSize = newBounds.size.div(Vec2.max(Vec2.ONE, oldBounds.size));

        const oldSize = Vec2.max(Vec2.ONE, this.size);
        const oldCenter = Vec2.rotated(this.position.sub(oldBounds.position), Vec2.ZERO, negatedRotation);

        const elementRot = this.rotation.sub(oldBounds.rotation);
        const elementCos = MathHelper.simpleCos(elementRot.degree);
        const elementSin = MathHelper.simpleSin(elementRot.degree);

        const rotatedRatio = new Vec2(
            (ratioSize.x * elementCos) + (ratioSize.y * elementSin),
            (ratioSize.x * elementSin) + (ratioSize.y * elementCos));

        const newSize = Vec2.max(oldSize.mul(rotatedRatio), Vec2.ZERO);
        const newCenter = Vec2.rotated(oldCenter.mul(ratioSize), Vec2.ZERO, newBounds.rotation);

        const newRotation = this.rotation.add(newBounds.rotation).sub(oldBounds.rotation);

        return new Transform(newCenter.add(newBounds.position), newSize, newRotation);
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

    public round(): Transform {
        const size = this.size.round();

        let x = Math.floor(this.position.x);
        let y = Math.floor(this.position.y);

        if (this.size.x % 2 === 1) {
            x += 0.5;
        }
        if (this.size.y % 2 === 1) {
            y += 0.5;
        }

        if (!size.equals(this.size) || this.position.x !== x || this.position.y !== y) {
            return new Transform(new Vec2(x, y), size, this.rotation);
        } else {
            return this;
        }
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
                y: this.position.y
            },
            size: {
                x: this.size.x,
                y: this.size.y
            },
            rotation: this.rotation.degree
        };
    }
}