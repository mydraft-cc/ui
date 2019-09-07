import { Rotation } from '@app/core';

describe('Rotation', () => {
    it('should sub correctly', () => {
        const rotation1 = Rotation.fromDegree(180);
        const rotation2 = Rotation.fromDegree(45);

        const actual = rotation1.sub(rotation2);
        const expected = Rotation.fromDegree(135);

        expect(actual).toEqual(expected);
    });

    it('should add correctly', () => {
        const rotation1 = Rotation.fromDegree(180);
        const rotation2 = Rotation.fromDegree(45);

        const actual = rotation1.add(rotation2);
        const expected = Rotation.fromDegree(225);

        expect(actual).toEqual(expected);
    });

    it('should calculate negated rotation', () => {
        const rotation = Rotation.fromDegree(180);

        const actual = rotation.negate();
        const expected = Rotation.fromDegree(-180);

        expect(actual).toEqual(expected);
    });

    it('should create rotation by degree', () => {
        const rotation = Rotation.fromDegree(180);

        expect(rotation.degree).toBe(180);
        expect(rotation.radian).toBe(Math.PI);

        expect(rotation.cos).toBe(Math.cos(Math.PI));
        expect(rotation.sin).toBe(Math.sin(Math.PI));

        expect(rotation.toString()).toBe('180°');
    });

    it('should create rotation by radian', () => {
        const rotation = Rotation.fromRadian(Math.PI);

        expect(rotation.degree).toBe(180);
        expect(rotation.radian).toBe(Math.PI);

        expect(rotation.cos).toBe(Math.cos(Math.PI));
        expect(rotation.sin).toBe(Math.sin(Math.PI));

        expect(rotation.toString()).toBe('180°');
    });

    it('should make correct equal comparisons', () => {
        expect(Rotation.fromDegree(123).equals(Rotation.fromDegree(123))).toBeTruthy();
        expect(Rotation.fromDegree(123).equals(Rotation.fromDegree(234))).toBeFalsy();
    });
});