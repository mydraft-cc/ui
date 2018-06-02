import {
    MathHelper,
    Rect2,
    Rotation,
    Vec2
} from '@app/core';

export class Transform {
    public static readonly ZERO = new Transform(Vec2.ZERO, Vec2.ZERO, Rotation.ZERO);

    private cachedAabb: Rect2;

    public get halfSize(): Vec2 {
        return this.size.mulScalar(0.5);
    }

    public get aabb(): Rect2 {
        return this.cachedAabb || (this.cachedAabb = Rect2.createRotated(this.position.sub(this.size.mulScalar(0.5)), this.size, this.rotation));
    }

    constructor(
        public readonly position: Vec2,
        public readonly size: Vec2,
        public readonly rotation: Rotation
    ) {
    }

    public static createFromRect(rect: Rect2): Transform {
        return new Transform(rect.position.add(rect.size.mulScalar(0.5)), rect.size, Rotation.ZERO);
    }

    public static createFromRects(rects: Rect2[]): Transform {
        return Transform.createFromRect(Rect2.createFromRects(rects));
    }

    public static createFromJS(js: any): Transform {
        return new Transform(new Vec2(js.position.x, js.position.y), new Vec2(js.size.x, js.size.y), Rotation.createFromDegree(js.rotation));
    }

    public static createFromTransformationsAndRotations(transforms: Transform[], rotation: Rotation): Transform {
        const negatedRotation = rotation.negate();

        const median = Vec2.createMedian(...transforms.map(t => t.position));

        const unrotatedTransforms = transforms.map(t => t.rotateAroundAnchor(median, negatedRotation));
        const unrotatedBounds = Rect2.createFromRects(unrotatedTransforms.map(x => x.aabb));

        const firstToCenterUnrotated = unrotatedTransforms[0].position.sub(unrotatedBounds.center);
        const firstToCenterRotated = Vec2.createRotated(firstToCenterUnrotated, Vec2.ZERO, rotation);

        const center = transforms[0].position.sub(firstToCenterRotated);

        const unrotatedTransformAabbs = transforms.map(t => t.rotateAroundAnchor(center, negatedRotation).aabb);

        const rect = Rect2.createFromRects(unrotatedTransformAabbs);

        return new Transform(rect.position.add(rect.size.mulScalar(0.5)), rect.size, rotation);
    }

    public eq(t: Transform) {
        return this.size.eq(t.size) && this.position.eq(t.position) && this.rotation.eq(t.rotation);
    }

    public ne(t: Transform) {
        return this.size.ne(t.size) || this.position.ne(t.position) || this.rotation.ne(t.rotation);
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
        const newPosition = Vec2.createRotated(this.position, anchor, rotation);

        return new Transform(newPosition, this.size, this.rotation.add(rotation));
    }

    public transformByBounds(oldBounds: Transform, newBounds: Transform): Transform {
        const negatedRotation = oldBounds.rotation.negate();

        const ratioSize = newBounds.size.div(Vec2.max(Vec2.ONE, oldBounds.size));

        const oldSize = Vec2.max(Vec2.ONE, this.size);
        const oldCenter = Vec2.createRotated(this.position.sub(oldBounds.position), Vec2.ZERO, negatedRotation);

        const elementRot = this.rotation.sub(oldBounds.rotation);
        const elementCos = MathHelper.simpleCos(elementRot.degree);
        const elementSin = MathHelper.simpleSin(elementRot.degree);

        const rotatedRatio = new Vec2(
            (ratioSize.x * elementCos) + (ratioSize.y * elementSin),
            (ratioSize.x * elementSin) + (ratioSize.y * elementCos));

        const newSize = Vec2.max(oldSize.mul(rotatedRatio), Vec2.ZERO);
        const newCenter = Vec2.createRotated(oldCenter.mul(ratioSize), Vec2.ZERO, newBounds.rotation);

        const newRotation = this.rotation.add(newBounds.rotation).sub(oldBounds.rotation);

        return new Transform(newCenter.add(newBounds.position), newSize, newRotation);
    }

    public round(): Transform {
        const size = this.size.round();

        let w = Math.floor(this.position.x);
        let h = Math.floor(this.position.y);

        if (this.size.x % 2 === 1) {
            w += 0.5;
        }
        if (this.size.y % 2 === 1) {
            h += 0.5;
        }

        if (size.ne(this.size) || this.position.x !== w || this.position.y !== h) {
            return new Transform(new Vec2(w, h), size, this.rotation);
        } else {
            return this;
        }
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