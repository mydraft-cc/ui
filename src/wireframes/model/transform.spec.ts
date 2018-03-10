import {
    Rect2,
    Rotation,
    Vec2
} from '@app/core';

import { Transform } from '@app/wireframes/model';

describe('Transform', () => {
    const transform = new Transform(new Vec2(10, 20), new Vec2(30, 40), Rotation.createFromDegree(45));

    it('should convert from json', () => {
        const json = {
            position: {
                x: 10,
                y: 20
            },
            size: {
                x: 30,
                y: 40
            },
            rotation: 45
        };

        const parsed = Transform.createFromJS(json);

        expect(parsed.position.x).toEqual(10);
        expect(parsed.position.y).toEqual(20);
        expect(parsed.size.x).toEqual(30);
        expect(parsed.size.y).toEqual(40);
        expect(parsed.rotation.degree).toEqual(45);
    });

    it('should convert to json', () => {
        const json = transform.toJS();

        expect(json.position.x).toEqual(10);
        expect(json.position.y).toEqual(20);
        expect(json.size.x).toEqual(30);
        expect(json.size.y).toEqual(40);
        expect(json.rotation).toEqual(45);
    });

    it('should make correct equal comparisons', () => {
        expect(transform.eq(transform.moveBy(Vec2.ZERO))).toBeTruthy();
        expect(transform.eq(transform.moveBy(Vec2.ONE))).toBeFalsy();
    });

    it('should make correct not equal comparisons', () => {
        expect(transform.ne(transform.moveBy(Vec2.ZERO))).toBeFalsy();
        expect(transform.ne(transform.moveBy(Vec2.ONE))).toBeTruthy();
    });

    it('should adjust position for size', () => {
        const newTransform = new Transform(new Vec2(10, 20), new Vec2(31, 41), Rotation.createFromDegree(45)).round();

        const actual = newTransform.position;
        const expected = new Vec2(10.5, 20.5);

        expect(actual).toEqual(expected);
    });

    it('should calculate to string', () => {
        const actual = new Transform(new Vec2(10, 20), new Vec2(30, 40), Rotation.createFromDegree(45)).toString();
        const expected = '<position: (10, 20), size: (30, 40), rotation: 45°>';

        expect(actual).toEqual(expected);
    });

    it('should calculate to string', () => {
        const actual = new Transform(new Vec2(10, 20), new Vec2(30, 40), Rotation.createFromDegree(45)).halfSize;
        const expected = new Vec2(15, 20);

        expect(actual).toEqual(expected);
    });

    it('should rotate around anchor', () => {
        const actual = transform.rotateAroundAnchor(new Vec2(25, 140), Rotation.createFromDegree(90));
        const expected = new Transform(new Vec2(145, 125), new Vec2(30, 40), Rotation.createFromDegree(135));

        expect(actual).toEqual(expected);
    });

    it('should replace position by moveTo', () => {
        const actual = transform.moveTo(new Vec2(100, 60));
        const expected = new Transform(new Vec2(100, 60), new Vec2(30, 40), Rotation.createFromDegree(45));

        expect(actual).toEqual(expected);
    });

    it('should add position by moveBy', () => {
        const actual = transform.moveBy(new Vec2(100, 60));
        const expected = new Transform(new Vec2(110, 80), new Vec2(30, 40), Rotation.createFromDegree(45));

        expect(actual).toEqual(expected);
    });

    it('should replace size by resizeTo', () => {
        const actual = transform.resizeTo(new Vec2(100, 60));
        const expected = new Transform(new Vec2(10, 20), new Vec2(100, 60), Rotation.createFromDegree(45));

        expect(actual).toEqual(expected);
    });

    it('should add size by resizeBy', () => {
        const actual = transform.resizeBy(new Vec2(100, 60));
        const expected = new Transform(new Vec2(10, 20), new Vec2(130, 100), Rotation.createFromDegree(45));

        expect(actual).toEqual(expected);
    });

    it('should replace rotation by rotateTo', () => {
        const actual = transform.rotateTo(Rotation.createFromDegree(90));
        const expected = new Transform(new Vec2(10, 20), new Vec2(30, 40), Rotation.createFromDegree(90));

        expect(actual).toEqual(expected);
    });

    it('should add size by rotateBy', () => {
        const actual = transform.rotateBy(Rotation.createFromDegree(90));
        const expected = new Transform(new Vec2(10, 20), new Vec2(30, 40), Rotation.createFromDegree(135));

        expect(actual).toEqual(expected);
    });

    it('Should create from rect', () => {
        const actual = Transform.createFromRect(new Rect2(new Vec2(100, 60), new Vec2(30, 40)));
        const expected = new Transform(new Vec2(115, 80), new Vec2(30, 40), Rotation.ZERO);

        expect(actual).toEqual(expected);
    });

    it('should provide zero transform', () => {
        const actual = Transform.ZERO;
        const expected = new Transform(Vec2.ZERO, Vec2.ZERO, Rotation.ZERO);

        expect(actual).toEqual(expected);
    });

    it('Should create from rects', () => {
        const rects = [
            new Rect2(new Vec2(100, 60), new Vec2(30, 40)),
            new Rect2(new Vec2(200, 60), new Vec2(30, 40))
        ];

        const actual = Transform.createFromRects(rects);
        const expected = new Transform(new Vec2(165, 80), new Vec2(130, 40), Rotation.ZERO);

        expect(actual).toEqual(expected);
    });

    it('should create from transformations and rotation', () => {
        const center = new Vec2(300, 150);

        const rotation = Rotation.createFromDegree(45);

        const transformation1 =
            new Transform(new Vec2(200, 100), new Vec2(100, 40), Rotation.ZERO)
                .rotateAroundAnchor(center, rotation);
        const transformation2 =
            new Transform(new Vec2(400, 200), new Vec2(100, 40), Rotation.ZERO)
                .rotateAroundAnchor(center, rotation);

        const actual = Transform.createFromTransformationsAndRotations([transformation1, transformation2], rotation);
        const expected = new Transform(new Vec2(300, 150), new Vec2(300, 140), Rotation.createFromDegree(45));

        expect(actual).toEqual(expected);
    });
});
