import {
    Rect2,
    Rotation,
    Vec2
} from '@app/core';

describe('Rect2', () => {
    it('should provide values from constructor', () => {
        const rect = new Rect2(10, 20, 50, 30);

        expect(rect.y).toBe(20);
        expect(rect.top).toBe(20);

        expect(rect.x).toBe(10);
        expect(rect.left).toBe(10);

        expect(rect.w).toBe(50);
        expect(rect.width).toBe(50);

        expect(rect.h).toBe(30);
        expect(rect.height).toBe(30);

        expect(rect.right).toBe(60);
        expect(rect.bottom).toBe(50);

        expect(rect.cx).toBe(35);
        expect(rect.cy).toBe(35);
        expect(rect.center).toEqual(new Vec2(35, 35));

        expect(rect.area).toBe(1500);

        expect(rect.toString()).toBe('(x: 10, y: 20, w: 50, h: 30)');
    });

    it('should calculate isEmpty correctly', () => {
        expect(new Rect2(10, 20, 50, 30).isEmpty).toBeFalsy();
        expect(new Rect2(10, 20, -1, 30).isEmpty).toBeTruthy();
        expect(new Rect2(10, 20, 50, -9).isEmpty).toBeTruthy();
    });

    it('should calculate isInfinite correctly', () => {
        expect(new Rect2(10, 20, 50, 30).isInfinite).toBeFalsy();
        expect(new Rect2(10, 20, Number.POSITIVE_INFINITY, 30).isInfinite).toBeTruthy();
        expect(new Rect2(10, 20, 50, Number.POSITIVE_INFINITY).isInfinite).toBeTruthy();
    });

    it('should inflate correctly', () => {
        const rect = new Rect2(10, 20, 50, 30);

        const actual1 = rect.inflateV(new Vec2(10, 20));
        const actual2 = rect.inflate(10, 20);
        const expected = new Rect2(0, 0, 70, 70);

        expect(actual1).toEqual(expected);
        expect(actual2).toEqual(expected);
    });

    it('should deflate correctly', () => {
        const rect = new Rect2(10, 20, 50, 30);

        const actual1 = rect.deflateV(new Vec2(25, 15));
        const actual2 = rect.deflate(25, 15);
        const expected = new Rect2(35, 35, 0, 0);

        expect(actual1).toEqual(expected);
        expect(actual2).toEqual(expected);
    });

    it('should return true for intersection with infinite rect', () => {
        const rect = new Rect2(10, 20, 50, 30);

        expect(rect.intersects(Rect2.INFINITY)).toBeTruthy();

        expect(Rect2.INFINITY.intersects(rect)).toBeTruthy();
        expect(Rect2.INFINITY.intersects(Rect2.INFINITY)).toBeTruthy();
    });

    it('should return false for intersection with empty rect', () => {
        const rect = new Rect2(10, 20, 50, 30);

        expect(rect.intersects(Rect2.EMPTY)).toBeFalsy();

        expect(Rect2.EMPTY.intersects(rect)).toBeFalsy();
        expect(Rect2.EMPTY.intersects(Rect2.INFINITY)).toBeFalsy();
    });

    it('should return empty for no intersection', () => {
        const rect = new Rect2(10, 20, 50, 30);
        const outer = new Rect2(100, 20, 50, 30);

        const actual = rect.intersect(outer);
        const expected = Rect2.EMPTY;

        expect(actual).toEqual(expected);
    });

    it('should return result for intersection', () => {
        const rect = new Rect2(10, 20, 50, 30);
        const inner = new Rect2(35, 35, 100, 30);

        const actual = rect.intersect(inner);
        const expected = new Rect2(35, 35, 25, 15);

        expect(actual).toEqual(expected);
    });

    it('should make correct contains by vector tests', () => {
        const rect = new Rect2(10, 20, 50, 30);

        expect(rect.contains(rect.center)).toBeTruthy();
        expect(rect.contains(new Vec2(rect.left, rect.top))).toBeTruthy();

        expect(rect.contains(new Vec2(rect.cx, 0))).toBeFalsy();
        expect(rect.contains(new Vec2(rect.cx, 100))).toBeFalsy();
        expect(rect.contains(new Vec2(100, rect.cy))).toBeFalsy();
        expect(rect.contains(new Vec2(-50, rect.cy))).toBeFalsy();
    });

    it('should return true when rect contains other rect', () => {
        const rect = new Rect2(400, 400, 400, 400);
        const other = new Rect2(500, 500, 200, 200);

        expect(rect.contains(other)).toBeTruthy();
    });

    it('should return false when other rect is too top', () => {
        const rect = new Rect2(400, 400, 400, 400);
        const other = new Rect2(300, 900, 300, 100);

        expect(rect.contains(other)).toBeFalsy();
    });

    it('should return false when other rect is too bottom', () => {
        const rect = new Rect2(400, 400, 400, 400);
        const other = new Rect2(300, 900, 100, 300);

        expect(rect.contains(other)).toBeFalsy();
    });

    it('should return false when other rect is too left', () => {
        const rect = new Rect2(400, 400, 400, 400);
        const other = new Rect2(200, 200, 100, 300);

        expect(rect.contains(other)).toBeFalsy();
    });

    it('should return false when other right is too left', () => {
        const rect = new Rect2(400, 400, 400, 400);
        const other = new Rect2(900, 200, 100, 300);

        expect(rect.contains(other)).toBeFalsy();
    });

    it('should return empty when creating from null vectors', () => {
        const actual = Rect2.fromVecs(null);
        const expected = Rect2.EMPTY;

        expect(actual).toEqual(expected);
    });

    it('should return empty when creating from null rects', () => {
        const actual = Rect2.fromRects(null);
        const expected = Rect2.EMPTY;

        expect(actual).toEqual(expected);
    });

    it('should provide valid zero instance', () => {
        const actual = Rect2.ZERO;
        const expected = new Rect2(0, 0, 0, 0);

        expect(actual).toEqual(expected);
    });

    it('should provide valid empty instance', () => {
        const actual = Rect2.EMPTY;
        const expected = new Rect2(Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY);

        expect(actual).toEqual(expected);
    });

    it('should provide valid infinite instance', () => {
        const actual = Rect2.INFINITY;
        const expected = new Rect2(Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY);

        expect(actual).toEqual(expected);
    });

    it('should create from center', () => {
        const actual = Rect2.fromCenter(new Vec2(100, 100), 10);
        const expected = new Rect2(100, 100, 20, 20);

        expect(actual).toEqual(expected);
    });

    it('should create correct rect from vectors', () => {
        const actual =
            Rect2.fromVecs([
                new Vec2(100, 100),
                new Vec2(500, 300),
                new Vec2(900, 800)]);
        const expected = new Rect2(100, 100, 800, 700);

        expect(actual).toEqual(expected);
    });

    it('should create correct rect from rects', () => {
        const actual =
            Rect2.fromRects([
                new Rect2(100, 100, 100, 100),
                new Rect2(500, 300, 100, 100),
                new Rect2(150, 150, 750, 650)]);
        const expected = new Rect2(100, 100, 800, 700);

        expect(actual).toEqual(expected);
    });

    it('should create rect from rotation', () => {
        const actual = Rect2.rotated(new Vec2(400, 300), new Vec2(600, 400), Rotation.fromRadian(Math.PI / 2));
        const expected = new Rect2(500, 200, 400, 600);

        expect(actual).toEqual(expected);
    });

    it('should create rect from zero rotation', () => {
        const actual = Rect2.rotated(new Vec2(400, 300), new Vec2(600, 400), Rotation.ZERO);
        const expected = new Rect2(400, 300, 600, 400);

        expect(actual).toEqual(expected);
    });

    it('should make valid equal comparisons', () => {
        expect(new Rect2(10, 10, 10, 10).equals(new Rect2(10, 10, 10, 10))).toBeTruthy();
        expect(new Rect2(10, 10, 10, 10).equals(new Rect2(20, 20, 20, 20))).toBeFalsy();
    });
});