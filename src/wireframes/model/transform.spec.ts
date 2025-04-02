/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rect2, Rotation, Vec2 } from '@app/core/utils';
import { Transform } from '@app/wireframes/model';

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
        
        // Allow for small variations in position and size
        expect(Math.abs(actual.position.x - 300)).toBeLessThan(1);
        expect(Math.abs(actual.position.y - 150)).toBeLessThan(1);
        expect(Math.abs(actual.size.x - 300)).toBeLessThan(1);
        expect(Math.abs(actual.size.y - 140)).toBeLessThan(1);
        expect(actual.rotation.degree).toBe(45);
    });

    it('should create from transformations with different rotations', () => {
        const center = new Vec2(300, 150);
        const baseSize = new Vec2(100, 40);
        
        const rotations = [0, 45, 90, 180].map(d => Rotation.fromDegree(d));
        
        for (const rotation of rotations) {
            const transformation1 =
                new Transform(new Vec2(200, 100), baseSize, Rotation.ZERO)
                    .rotateAroundAnchor(center, rotation);
            const transformation2 =
                new Transform(new Vec2(400, 200), baseSize, Rotation.ZERO)
                    .rotateAroundAnchor(center, rotation);

            const actual = Transform.createFromTransformationsAndRotation([transformation1, transformation2], rotation);
            
            expect(actual.rotation.degree).toBe(rotation.degree);
            expect(actual.size.x).toBeGreaterThan(0);
            expect(actual.size.y).toBeGreaterThan(0);
            expect(actual.position.x).toBeGreaterThan(0);
            expect(actual.position.y).toBeGreaterThan(0);
        }
    });

    it('should handle single transform correctly', () => {
        const transform = new Transform(new Vec2(100, 100), new Vec2(50, 30), Rotation.fromDegree(45));
        const result = Transform.createFromTransformationsAndRotation([transform], transform.rotation);
        
        expect(result.position.x).toBe(100);
        expect(result.position.y).toBe(100);
        expect(result.size.x).toBe(50);
        expect(result.size.y).toBe(30);
        expect(result.rotation.degree).toBe(45);
    });

    it('should handle three transforms correctly', () => {
        const center = new Vec2(300, 150);
        const rotation = Rotation.fromDegree(45);
        const baseSize = new Vec2(100, 40);
        
        const transformation1 =
            new Transform(new Vec2(200, 100), baseSize, Rotation.ZERO)
                .rotateAroundAnchor(center, rotation);
        const transformation2 =
            new Transform(new Vec2(400, 200), baseSize, Rotation.ZERO)
                .rotateAroundAnchor(center, rotation);
        const transformation3 =
            new Transform(new Vec2(300, 150), baseSize, Rotation.ZERO)
                .rotateAroundAnchor(center, rotation);

        const actual = Transform.createFromTransformationsAndRotation(
            [transformation1, transformation2, transformation3], 
            rotation
        );
        
        expect(actual.rotation.degree).toBe(45);
        expect(actual.size.x).toBeGreaterThan(0);
        expect(actual.size.y).toBeGreaterThan(0);
        expect(actual.position.x).toBeGreaterThan(0);
        expect(actual.position.y).toBeGreaterThan(0);
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
});
