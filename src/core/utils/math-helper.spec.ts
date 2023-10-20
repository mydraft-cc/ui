/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper } from '@app/core/utils';

describe('MathHelper', () => {
    it('should calculate different guids', () => {
        const guid1 = MathHelper.guid();
        const guid2 = MathHelper.guid();

        expect(guid1).not.toBe(guid2);
    });

    it('should calculate different ids', () => {
        const id1 = MathHelper.nextId();
        const id2 = MathHelper.nextId();

        expect(id1).not.toBe(id2);
    });

    it('should convert to rad', () => {
        expect(MathHelper.toRad(0)).toBe(0);
        expect(MathHelper.toRad(180)).toBe(Math.PI * 1);
        expect(MathHelper.toRad(360)).toBe(Math.PI * 2);
    });

    it('should convert to degree', () => {
        expect(MathHelper.toDegree(0)).toBe(0);
        expect(MathHelper.toDegree(Math.PI * 1)).toBe(180);
        expect(MathHelper.toDegree(Math.PI * 2)).toBe(360);
    });

    it('should adjust invalid degrees', () => {
        expect(MathHelper.toPositiveDegree(36.5 - (1 * 360))).toBe(36.5);
        expect(MathHelper.toPositiveDegree(36.5 - (2 * 360))).toBe(36.5);
        expect(MathHelper.toPositiveDegree(36.5 + (1 * 360))).toBe(36.5);
        expect(MathHelper.toPositiveDegree(36.5 + (2 * 360))).toBe(36.5);
    });

    it('should calculate multiple of 10', () => {
        expect(MathHelper.roundToMultipleOf(13, 10)).toBe(10);
        expect(MathHelper.roundToMultipleOf(16, 10)).toBe(20);
    });

    it('should calculate multiple of 2', () => {
        expect(MathHelper.roundToMultipleOfTwo(13)).toBe(14);
        expect(MathHelper.roundToMultipleOfTwo(12.2)).toBe(12);
    });
});
