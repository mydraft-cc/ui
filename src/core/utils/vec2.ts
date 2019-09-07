import { MathHelper } from './math-helper';

import { Rotation } from './rotation';

export class Vec2 {
    public static readonly ZERO = new Vec2(0, 0);

    public static readonly ONE = new Vec2(1, 1);

    public static readonly POSITIVE_INFINITY = new Vec2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);
    public static readonly NEGATIVE_INFINITY = new Vec2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

    public get length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public get lengtSquared(): number {
        return this.x * this.x + this.y * this.y;
    }

    constructor(
        public readonly x: number,
        public readonly y: number
    ) {
        Object.freeze(this);
    }

    public equals(v: Vec2): boolean {
        return Vec2.equals(this, v);
    }

    public static equals(lhs: Vec2, rhs: Vec2): boolean {
        return lhs.x === rhs.x && lhs.y === rhs.y;
    }

    public toString(): string {
        return `(${this.x}, ${this.y})`;
    }

    public add(v: Vec2 | number): Vec2 {
        if (v instanceof Vec2) {
            return new Vec2(this.x + v.x, this.y + v.y);
        } else {
            return new Vec2(this.x + v, this.y + v);
        }
    }

    public sub(v: Vec2 | number): Vec2 {
        if (v instanceof Vec2) {
            return new Vec2(this.x - v.x, this.y - v.y);
        } else {
            return new Vec2(this.x - v, this.y - v);
        }
    }

    public mul(v: Vec2 | number): Vec2 {
        if (v instanceof Vec2) {
            return new Vec2(this.x * v.x, this.y * v.y);
        } else {
            return new Vec2(this.x * v, this.y * v);
        }
    }

    public div(v: Vec2 | number): Vec2 {
        if (v instanceof Vec2) {
            return new Vec2(this.x / v.x, this.y / v.y);
        } else {
            return new Vec2(this.x / v, this.y / v);
        }
    }

    public negate(): Vec2 {
        return new Vec2(-this.x, -this.y);
    }

    public static max(lhs: Vec2, rhs: Vec2): Vec2 {
        return new Vec2(Math.max(lhs.x, rhs.x), Math.max(lhs.y, rhs.y));
    }

    public static min(lhs: Vec2, rhs: Vec2): Vec2 {
        return new Vec2(Math.min(lhs.x, rhs.x), Math.min(lhs.y, rhs.y));
    }

    public round(factor = 1): Vec2 {
        return new Vec2(MathHelper.roundToMultipleOf(this.x, factor), MathHelper.roundToMultipleOf(this.y, factor));
    }

    public roundToMultipleOfTwo(): Vec2 {
        return new Vec2(MathHelper.roundToMultipleOf(this.x, 2), MathHelper.roundToMultipleOf(this.y, 2));
    }

    public static rotated(vec: Vec2, center: Vec2, rotation: Rotation): Vec2 {
        const x = vec.x - center.x;
        const y = vec.y - center.y;

        const result = new Vec2(
            (x * rotation.cos) - (y * rotation.sin) + center.x,
            (x * rotation.sin) + (y * rotation.cos) + center.y);

        return result;
    }

    public static median(...vecs: Vec2[]) {
        let medianX = 0;
        let medianY = 0;

        for (let v of vecs) {
            medianX += v.x;
            medianY += v.y;
        }

        return new Vec2(medianX / vecs.length, medianY / vecs.length);
    }

    public static angleBetween(lhs: Vec2, rhs: Vec2): number {
        const y = (lhs.x * rhs.y) - (rhs.x * lhs.y);
        const x = (lhs.x * rhs.x) + (lhs.y * rhs.y);

        return MathHelper.toPositiveDegree(MathHelper.toDegree(Math.atan2(y, x)));
    }
}