/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rect2, Rotation, Vec2 } from '@app/core/utils';
import { Constraint, Transform } from '@app/wireframes/model';

/* eslint-disable @typescript-eslint/naming-convention */

describe('Transform', () => {
    const transform = new Transform(new Vec2(10, 20), new Vec2(30, 40), Rotation.fromDegree(45));

    it('should convert from old json', () => {
        const json = {
            position: {
                x: 10,
                y: 20,
            },
            size: {
                x: 30,
                y: 40,
            },
            rotation: 45,
        };

        const parsed = Transform.fromJS(json);

        expect(parsed.position.x).toEqual(10);
        expect(parsed.position.y).toEqual(20);
        expect(parsed.size.x).toEqual(30);
        expect(parsed.size.y).toEqual(40);
        expect(parsed.rotation.degree).toEqual(45);
    });

    it('should convert from new json', () => {
        const json = {
            x: 10,
            y: 20,
            w: 30,
            h: 40,
            r: 45,
        };

        const parsed = Transform.fromJS(json);

        expect(parsed.position.x).toEqual(10);
        expect(parsed.position.y).toEqual(20);
        expect(parsed.size.x).toEqual(30);
        expect(parsed.size.y).toEqual(40);
        expect(parsed.rotation.degree).toEqual(45);
    });

    it('should convert to json', () => {
        const json = transform.toJS();

        expect(json.x).toEqual(10);
        expect(json.y).toEqual(20);
        expect(json.w).toEqual(30);
        expect(json.h).toEqual(40);
        expect(json.r).toEqual(45);
    });

    it('should make correct equal comparisons', () => {
        expect(transform.equals(transform.moveBy(Vec2.ZERO))).toBeTruthy();
        expect(transform.equals(transform.moveBy(Vec2.ONE))).toBeFalsy();
    });

    it('should calculate to string', () => {
        const actual = new Transform(new Vec2(10, 20), new Vec2(30, 40), Rotation.fromDegree(45)).toString();
        const expected = '<position: (10, 20), size: (30, 40), rotation: 45°>';

        expect(actual).toEqual(expected);
    });

    it('should calculate to string', () => {
        const actual = new Transform(new Vec2(10, 20), new Vec2(30, 40), Rotation.fromDegree(45)).halfSize;
        const expected = new Vec2(15, 20);

        expect(actual).toEqual(expected);
    });

    it('should rotate around anchor', () => {
        const actual = transform.rotateAroundAnchor(new Vec2(25, 140), Rotation.fromDegree(90));
        const expected = new Transform(new Vec2(145, 125), new Vec2(30, 40), Rotation.fromDegree(135));

        expect(actual).toEqual(expected);
    });

    it('should replace position by moveTo', () => {
        const actual = transform.moveTo(new Vec2(100, 60));
        const expected = new Transform(new Vec2(100, 60), new Vec2(30, 40), Rotation.fromDegree(45));

        expect(actual).toEqual(expected);
    });

    it('should add position by moveBy', () => {
        const actual = transform.moveBy(new Vec2(100, 60));
        const expected = new Transform(new Vec2(110, 80), new Vec2(30, 40), Rotation.fromDegree(45));

        expect(actual).toEqual(expected);
    });

    it('should replace size by resizeTo', () => {
        const actual = transform.resizeTo(new Vec2(100, 60));
        const expected = new Transform(new Vec2(10, 20), new Vec2(100, 60), Rotation.fromDegree(45));

        expect(actual).toEqual(expected);
    });

    it('should add size by resizeBy', () => {
        const actual = transform.resizeBy(new Vec2(100, 60));
        const expected = new Transform(new Vec2(10, 20), new Vec2(130, 100), Rotation.fromDegree(45));

        expect(actual).toEqual(expected);
    });

    it('should replace rotation by rotateTo', () => {
        const actual = transform.rotateTo(Rotation.fromDegree(90));
        const expected = new Transform(new Vec2(10, 20), new Vec2(30, 40), Rotation.fromDegree(90));

        expect(actual).toEqual(expected);
    });

    it('should add size by rotateBy', () => {
        const actual = transform.rotateBy(Rotation.fromDegree(90));
        const expected = new Transform(new Vec2(10, 20), new Vec2(30, 40), Rotation.fromDegree(135));

        expect(actual).toEqual(expected);
    });

    it('Should create from rect', () => {
        const actual = Transform.fromRect(new Rect2(100, 60, 30, 40));
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
            new Rect2(100, 60, 30, 40),
            new Rect2(200, 60, 30, 40),
        ];

        const actual = Transform.fromRects(rects);
        const expected = new Transform(new Vec2(165, 80), new Vec2(130, 40), Rotation.ZERO);

        expect(actual).toEqual(expected);
    });

    it('should create from transformations and rotation', () => {
        const center = new Vec2(300, 150);

        const rotation = Rotation.fromDegree(45);

        const transformation1 =
            new Transform(new Vec2(200, 100), new Vec2(100, 40), Rotation.ZERO)
                .rotateAroundAnchor(center, rotation);
        const transformation2 =
            new Transform(new Vec2(400, 200), new Vec2(100, 40), Rotation.ZERO)
                .rotateAroundAnchor(center, rotation);

        const actual = Transform.createFromTransformationsAndRotation([transformation1, transformation2], rotation);
        const expected = new Transform(new Vec2(300, 150), new Vec2(300, 140), Rotation.fromDegree(45));

        expect(actual.equals(expected)).toBeTruthy();
    });

    it('should return same instance when resizing to same size', () => {
        const transform_0 = new Transform(Vec2.ZERO, new Vec2(100, 100), Rotation.ZERO);
        const transform_1 = transform_0.resizeTopLeft(new Vec2(100, 100));

        expect(transform_1).toBe(transform_0);
    });

    [
        { rotation: 0,   expectedPosition: new Vec2(150, 100) }, 
        { rotation: 90,  expectedPosition: new Vec2(100, 150) }, 
        { rotation: 180, expectedPosition: new Vec2(50, 100) },
        { rotation: 270, expectedPosition: new Vec2(100, 50) },
    ].forEach(test => {
        it(`should resize top left with ${test.rotation} rotation`, () => {
            const oldSize = new Vec2(100, 100);
            const oldPos = new Vec2(100, 100);

            const newSize = new Vec2(200, 100);
            const newPos = test.expectedPosition;

            const rotation = Rotation.fromDegree(test.rotation);

            const actual = new Transform(oldPos, oldSize, rotation).resizeTopLeft(newSize);
            const expected = new Transform(newPos, newSize, rotation);

            expect(actual).toEqual(expected);
        });
    });

    [
        { dw:  2, dx:  1 },
        { dw:  1, dx:  0.5 },
        { dw: -2, dx: -1 },
        { dw: -1, dx: -0.5 },
    ].forEach(test => {
        it(`should transform by bounds with dw=${test.dw} and dx=${test.dx}`, () => {
            const source = new Transform(new Vec2(50, 50), new Vec2(100, 100), Rotation.ZERO);
            const target = new Transform(new Vec2(50 + test.dx, 50), new Vec2(100 + test.dw, 100), Rotation.ZERO);
    
            const actual = source.transformByBounds(source, target, undefined);
    
            expect(actual.position).toEqual(target.position);
            expect(actual.size).toEqual(target.size);
        });
    });

    it('should not snap position and size when the rotation is negative', () => {
        const actual = new Transform(new Vec2(10.4, 20.6), new Vec2(31, 41), Rotation.fromDegree(-45));

        expect(actual.position).toEqual(new Vec2(10.4, 20.6));
        expect(actual.size).toEqual(new Vec2(31, 41));
    });

    it('should treat negative rotations like their positive equivalent', () => {
        const negative = new Transform(new Vec2(10.4, 20.6), new Vec2(31, 41), Rotation.fromDegree(-45));
        const positive = new Transform(new Vec2(10.4, 20.6), new Vec2(31, 41), Rotation.fromDegree(315));

        expect(negative.position).toEqual(positive.position);
        expect(negative.size).toEqual(positive.size);
    });

    [0, 360, -360, 0.4, -0.4].forEach(rotation => {
        it(`should snap position and size when the rotation is ${rotation}`, () => {
            const actual = new Transform(new Vec2(10.4, 20.6), new Vec2(31, 41), Rotation.fromDegree(rotation));

            expect(actual.position).toEqual(new Vec2(10.5, 20.5));
            expect(actual.size).toEqual(new Vec2(31, 41));
        });
    });

    [
        { rotation:   0, expectedOffset: new Vec2(+30, +40) },
        { rotation:  90, expectedOffset: new Vec2(-40, +30) },
        { rotation: 180, expectedOffset: new Vec2(-30, -40) },
        { rotation: 270, expectedOffset: new Vec2(+40, -30) },
    ].forEach(test => {
        it(`should keep the unrotated top left corner when resizing with ${test.rotation} rotation`, () => {
            const rotation = Rotation.fromDegree(test.rotation);

            const transform_0 = new Transform(new Vec2(200, 200), new Vec2(100, 60), rotation);
            const transform_1 = transform_0.resizeTopLeft(new Vec2(160, 140));

            expect(transform_1.size).toEqual(new Vec2(160, 140));
            expect(transform_1.position).toEqual(new Vec2(200, 200).add(test.expectedOffset));

            // The corner that the resize is anchored to must not move.
            expect(topLeft(transform_1).x).toBeCloseTo(topLeft(transform_0).x, 5);
            expect(topLeft(transform_1).y).toBeCloseTo(topLeft(transform_0).y, 5);
        });
    });

    [45, 135, 225, 315].forEach(rotation => {
        it(`should almost keep the unrotated top left corner when resizing with ${rotation} rotation`, () => {
            const transform_0 = new Transform(new Vec2(200, 200), new Vec2(100, 60), Rotation.fromDegree(rotation));
            const transform_1 = transform_0.resizeTopLeft(new Vec2(160, 120));

            // The center offset is rounded, therefore the corner can be off by half a pixel.
            expect(Math.abs(topLeft(transform_1).x - topLeft(transform_0).x)).toBeLessThanOrEqual(1);
            expect(Math.abs(topLeft(transform_1).y - topLeft(transform_0).y)).toBeLessThanOrEqual(1);
        });
    });

    [
        { rotation:   0, newSize: new Vec2(200, 100), expectedSize: new Vec2(80, 20) },
        { rotation:  90, newSize: new Vec2(200, 100), expectedSize: new Vec2(40, 40) },
        { rotation: 180, newSize: new Vec2(200, 100), expectedSize: new Vec2(80, 20) },
        { rotation: 270, newSize: new Vec2(200, 100), expectedSize: new Vec2(40, 40) },
        { rotation:   0, newSize: new Vec2(100, 300), expectedSize: new Vec2(40, 60) },
        { rotation:  90, newSize: new Vec2(100, 300), expectedSize: new Vec2(120, 20) },
        { rotation: 180, newSize: new Vec2(100, 300), expectedSize: new Vec2(40, 60) },
        { rotation: 270, newSize: new Vec2(100, 300), expectedSize: new Vec2(120, 20) },
    ].forEach(test => {
        it(`should scale child with ${test.rotation} rotation for bounds ${test.newSize}`, () => {
            const boundsOld = new Transform(new Vec2(100, 100), new Vec2(100, 100), Rotation.ZERO);
            const boundsNew = new Transform(new Vec2(100, 100), test.newSize, Rotation.ZERO);

            const child = new Transform(new Vec2(100, 100), new Vec2(40, 20), Rotation.fromDegree(test.rotation));

            const actual = child.transformByBounds(boundsOld, boundsNew, undefined);

            expect(actual.size.x).toBeCloseTo(test.expectedSize.x, 5);
            expect(actual.size.y).toBeCloseTo(test.expectedSize.y, 5);
        });
    });

    [0, 90, 180, 270].forEach(rotation => {
        it(`should scale the bounding box of a child with ${rotation} rotation like the bounds`, () => {
            const boundsOld = new Transform(new Vec2(100, 100), new Vec2(100, 100), Rotation.ZERO);
            const boundsNew = new Transform(new Vec2(100, 100), new Vec2(200, 300), Rotation.ZERO);

            const child = new Transform(new Vec2(100, 100), new Vec2(40, 20), Rotation.fromDegree(rotation));

            const actual = child.transformByBounds(boundsOld, boundsNew, undefined);

            expect(actual.aabb.w).toBeCloseTo(child.aabb.w * 2, 5);
            expect(actual.aabb.h).toBeCloseTo(child.aabb.h * 3, 5);
        });
    });

    [45, 135, 225, 315].forEach(rotation => {
        it(`should not collapse a child with ${rotation} rotation`, () => {
            const boundsOld = new Transform(new Vec2(100, 100), new Vec2(100, 100), Rotation.ZERO);
            const boundsNew = new Transform(new Vec2(100, 100), new Vec2(200, 100), Rotation.ZERO);

            const child = new Transform(new Vec2(100, 100), new Vec2(40, 20), Rotation.fromDegree(rotation));

            const actual = child.transformByBounds(boundsOld, boundsNew, undefined);

            // The diagonal of the child is stretched, therefore both sides have to grow.
            expect(actual.size.x).toBeGreaterThan(child.size.x);
            expect(actual.size.y).toBeGreaterThan(child.size.y);
        });
    });

    [0, 45, 90, 180, 270].forEach(rotation => {
        it(`should keep the size of a child with ${rotation} rotation for a pure move`, () => {
            const boundsOld = new Transform(new Vec2(100, 100), new Vec2(100, 100), Rotation.ZERO);
            const boundsNew = boundsOld.moveBy(new Vec2(50, 70));

            const child = new Transform(new Vec2(100, 100), new Vec2(40, 20), Rotation.fromDegree(rotation));

            const actual = child.transformByBounds(boundsOld, boundsNew, undefined);

            expect(actual.size.x).toBeCloseTo(40, 5);
            expect(actual.size.y).toBeCloseTo(20, 5);
            expect(actual.position).toEqual(new Vec2(150, 170));
        });
    });

    [
        { rotation:  0, name: 'aligned' },
        { rotation: 90, name: 'rotated' },
    ].forEach(test => {
        it(`should not calculate the width of a ${test.name} child with a x constraint`, () => {
            const child = new Transform(new Vec2(100, 100), new Vec2(100, 40), Rotation.fromDegree(test.rotation));

            const actual = child.transformByBounds(CONSTRAINED_OLD, CONSTRAINED_NEW, constraint(true, false));

            expect(actual.size.x).toEqual(100);
        });

        it(`should not calculate the height of a ${test.name} child with a y constraint`, () => {
            const child = new Transform(new Vec2(100, 100), new Vec2(100, 40), Rotation.fromDegree(test.rotation));

            const actual = child.transformByBounds(CONSTRAINED_OLD, CONSTRAINED_NEW, constraint(false, true));

            expect(actual.size.y).toEqual(40);
        });

        it(`should calculate both sizes of a ${test.name} child without constraints`, () => {
            const child = new Transform(new Vec2(100, 100), new Vec2(100, 40), Rotation.fromDegree(test.rotation));

            const actual = child.transformByBounds(CONSTRAINED_OLD, CONSTRAINED_NEW, constraint(false, false));

            expect(actual.size.x).not.toEqual(100);
            expect(actual.size.y).not.toEqual(40);
        });
    });

    it('should transform a child that fills the bounds to the new bounds', () => {
        const boundsOld = new Transform(new Vec2(100, 100), new Vec2(100, 40), Rotation.ZERO);
        const boundsNew = new Transform(new Vec2(300, 250), new Vec2(400, 160), Rotation.ZERO);

        const actual = boundsOld.transformByBounds(boundsOld, boundsNew, undefined);

        expect(actual.position).toEqual(boundsNew.position);
        expect(actual.size).toEqual(boundsNew.size);
    });
});

const CONSTRAINED_OLD = new Transform(new Vec2(100, 100), new Vec2(100, 40), Rotation.ZERO);
const CONSTRAINED_NEW = new Transform(new Vec2(100, 100), new Vec2(400, 160), Rotation.ZERO);

function topLeft(transform: Transform) {
    return Vec2.rotated(transform.position.sub(transform.size.mul(0.5)), transform.position, transform.rotation);
}

function constraint(sizeX: boolean, sizeY: boolean): Constraint {
    return {
        updateSize: (_shape, size) => size,
        calculateSizeX: () => sizeX,
        calculateSizeY: () => sizeY,
    };
}
