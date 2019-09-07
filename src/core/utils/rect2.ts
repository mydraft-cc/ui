import { Rotation } from './rotation';

import { Vec2 } from './vec2';

export class Rect2 {
    public static readonly ZERO = new Rect2(0, 0, 0, 0);
    public static readonly EMPTY = new Rect2(
        Number.NEGATIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.NEGATIVE_INFINITY);
    public static readonly INFINITY = new Rect2(
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY);

    public get center(): Vec2 {
        return new Vec2(this.x + (0.5 * this.w), this.y + (0.5 * this.h));
    }

    public get area(): number {
        return this.w * this.h;
    }

    public get left(): number {
        return this.x;
    }

    public get top(): number {
        return this.y;
    }

    public get right(): number {
        return this.x + this.w;
    }

    public get bottom(): number {
        return this.y + this.h;
    }

    public get width(): number {
        return this.w;
    }

    public get height(): number {
        return this.h;
    }

    public get cx(): number {
        return this.x + (0.5 * this.w);
    }

    public get cy(): number {
        return this.y + (0.5 * this.h);
    }

    public get isEmpty(): boolean {
        return this.w < 0 || this.h < 0;
    }

    public get isInfinite(): boolean {
        return this.w === Number.POSITIVE_INFINITY || this.h === Number.POSITIVE_INFINITY;
    }

    constructor(
        public readonly x: number,
        public readonly y: number,
        public readonly w: number,
        public readonly h: number
    ) {
        Object.freeze(this);
    }

    public static fromCenter(center: Vec2, radius: number) {
        return new Rect2(center.x, center.y, 2 * radius, 2 * radius);
    }

    public static fromVecs(vecs: Vec2[] | null): Rect2 {
        if (!vecs || vecs.length === 0) {
            return Rect2.EMPTY;
        }

        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let maxX = Number.MIN_VALUE;
        let maxY = Number.MIN_VALUE;

        for (let v of vecs) {
            minX = Math.min(minX, v.x);
            minY = Math.min(minY, v.y);
            maxX = Math.max(maxX, v.x);
            maxY = Math.max(maxY, v.y);
        }

        return new Rect2(minX, minY, Math.max(0, maxX - minX), Math.max(0, maxY - minY));
    }

    public static fromRects(rects: Rect2[] | null): Rect2 {
        if (!rects || rects.length === 0) {
            return Rect2.EMPTY;
        }

        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let maxX = Number.MIN_VALUE;
        let maxY = Number.MIN_VALUE;

        for (let r of rects) {
            minX = Math.min(minX, r.left);
            minY = Math.min(minY, r.top);
            maxX = Math.max(maxX, r.right);
            maxY = Math.max(maxY, r.bottom);
        }

        return new Rect2(minX, minY, Math.max(0, maxX - minX), Math.max(0, maxY - minY));
    }

    public static rotated(position: Vec2, size: Vec2, rotation: Rotation): Rect2 {
        const x = position.x;
        const y = position.y;
        const w = size.x;
        const h = size.y;

        if (Math.abs(rotation.sin) < Number.EPSILON) {
            return new Rect2(x, y, w, h);
        }

        const center = new Vec2(x + (w * 0.5), y + (h * 0.5));

        const lt = Vec2.rotated(new Vec2(x + 0, y + 0), center, rotation);
        const rt = Vec2.rotated(new Vec2(x + w, y + 0), center, rotation);
        const rb = Vec2.rotated(new Vec2(x + w, y + h), center, rotation);
        const lb = Vec2.rotated(new Vec2(x + 0, y + h), center, rotation);

        return Rect2.fromVecs([lb, lt, rb, rt]);
    }

    public equals(r: Rect2): boolean {
        return Rect2.equals(this, r);
    }

    public static equals(lhs: Rect2, rhs: Rect2): boolean {
        return lhs.x === rhs.x && lhs.y === rhs.y && lhs.w === rhs.w && lhs.h === rhs.h;
    }

    public toString(): string {
        return `(x: ${this.x}, y: ${this.y}, w: ${this.width}, h: ${this.height})`;
    }

    public inflateV(v: Vec2): Rect2 {
        return this.inflate(v.x, v.y);
    }

    public deflateV(v: Vec2): Rect2 {
        return this.deflate(v.x, v.y);
    }

    public inflate(w: number, h?: number): Rect2 {
        h = h || w;

        return new Rect2(this.x - w, this.y - h, this.w + (2 * w), this.h + (2 * h));
    }

    public deflate(w: number, h?: number): Rect2 {
        h = h || w;

        return new Rect2(this.x + w, this.y + h, Math.max(0, this.w - (2 * w)), Math.max(0, this.h - (2 * h)));
    }

    public contains(v: Rect2 | Vec2): boolean {
        if (v instanceof Rect2) {
            return v.x >= this.x && v.right <= this.right && v.y >= this.y && v.bottom <= this.bottom;
        } else {
            return v.x >= this.x && v.x - this.w <= this.x && v.y >= this.y && v.y - this.h <= this.y;
        }
    }

    public intersects(r: Rect2): boolean {
        return !this.isEmpty && !r.isEmpty && ((r.left <= this.right && r.right >= this.left && r.top <= this.bottom && r.bottom >= this.top) || this.isInfinite || r.isInfinite);
    }

    public intersect(r: Rect2): Rect2 {
        if (!this.intersects(r)) {
            return Rect2.EMPTY;
        }

        const minX = Math.max(this.x, r.x);
        const minY = Math.max(this.y, r.y);

        const w = Math.min(this.x + this.w, r.x + r.w) - minX;
        const h = Math.min(this.y + this.h, r.y + r.h) - minY;

        return new Rect2(minX, minY, Math.max(w, 0.0), Math.max(h, 0.0));
    }
}