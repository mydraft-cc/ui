/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rect2, Vec2 } from '@app/core';
import { Transform } from '@app/wireframes/model';

/* eslint-disable @typescript-eslint/naming-convention */

describe('Transform', () => {
    const transform = new Transform(new Vec2(10, 20), new Vec2(30, 40));

    it('should convert from json', () => {
        const json = {
            position: {
                x: 10,
                y: 20,
            },
            size: {
                x: 30,
                y: 40,
            },
        };

        const parsed = Transform.fromJS(json);

        expect(parsed.position.x).toEqual(10);
        expect(parsed.position.y).toEqual(20);
        expect(parsed.size.x).toEqual(30);
        expect(parsed.size.y).toEqual(40);
    });

    it('should convert to json', () => {
        const json = transform.toJS();

        expect(json.position.x).toEqual(10);
        expect(json.position.y).toEqual(20);
        expect(json.size.x).toEqual(30);
        expect(json.size.y).toEqual(40);
    });

    it('should make correct equal comparisons', () => {
        expect(transform.equals(transform.moveBy(Vec2.ZERO))).toBeTruthy();
        expect(transform.equals(transform.moveBy(Vec2.ONE))).toBeFalsy();
    });

    it('should calculate to string', () => {
        const actual = new Transform(new Vec2(10, 20), new Vec2(30, 40)).toString();
        const expected = '<position: (10, 20), size: (30, 40)>';

        expect(actual).toEqual(expected);
    });

    it('should calculate to string', () => {
        const actual = new Transform(new Vec2(10, 20), new Vec2(30, 40)).halfSize;
        const expected = new Vec2(15, 20);

        expect(actual).toEqual(expected);
    });

    it('should replace position by moveTo', () => {
        const actual = transform.moveTo(new Vec2(100, 60));
        const expected = new Transform(new Vec2(100, 60), new Vec2(30, 40));

        expect(actual).toEqual(expected);
    });

    it('should add position by moveBy', () => {
        const actual = transform.moveBy(new Vec2(100, 60));
        const expected = new Transform(new Vec2(110, 80), new Vec2(30, 40));

        expect(actual).toEqual(expected);
    });

    it('should replace size by resizeTo', () => {
        const actual = transform.resizeTo(new Vec2(100, 60));
        const expected = new Transform(new Vec2(10, 20), new Vec2(100, 60));

        expect(actual).toEqual(expected);
    });

    it('should add size by resizeBy', () => {
        const actual = transform.resizeBy(new Vec2(100, 60));
        const expected = new Transform(new Vec2(10, 20), new Vec2(130, 100));

        expect(actual).toEqual(expected);
    });

    it('Should create from rect', () => {
        const actual = Transform.fromRect(new Rect2(100, 60, 30, 40));
        const expected = new Transform(new Vec2(100, 60), new Vec2(30, 40));

        expect(actual).toEqual(expected);
    });

    it('should provide zero transform', () => {
        const actual = Transform.ZERO;
        const expected = new Transform(Vec2.ZERO, Vec2.ZERO);

        expect(actual).toEqual(expected);
    });

    it('Should create from rects', () => {
        const rects = [
            new Rect2(100, 60, 30, 40),
            new Rect2(200, 60, 30, 40),
        ];

        const actual = Transform.fromRects(rects);
        const expected = new Transform(new Vec2(100, 60), new Vec2(130, 40));

        expect(actual).toEqual(expected);
    });
});
