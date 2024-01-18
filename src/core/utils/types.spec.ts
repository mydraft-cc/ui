/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Types } from './types';

describe('Types', () => {
    it('should make string check', () => {
        expect(Types.isString('')).toBeTruthy();
        expect(Types.isString('string')).toBeTruthy();

        expect(Types.isString(false)).toBeFalsy();
    });

    it('should make number check', () => {
        expect(Types.isNumber(0)).toBeTruthy();
        expect(Types.isNumber(1)).toBeTruthy();

        expect(Types.isNumber(NaN)).toBeFalsy();
        expect(Types.isNumber(Infinity)).toBeFalsy();
        expect(Types.isNumber(false)).toBeFalsy();
    });

    it('should make boolean check', () => {
        expect(Types.isBoolean(true)).toBeTruthy();
        expect(Types.isBoolean(false)).toBeTruthy();

        expect(Types.isBoolean(0)).toBeFalsy();
        expect(Types.isBoolean(1)).toBeFalsy();
    });

    it('should make number array check', () => {
        expect(Types.isArrayOfNumber([])).toBeTruthy();
        expect(Types.isArrayOfNumber([0, 1])).toBeTruthy();

        expect(Types.isArrayOfNumber(['0', 1])).toBeFalsy();
    });

    it('should make string array check', () => {
        expect(Types.isArrayOfString([])).toBeTruthy();
        expect(Types.isArrayOfString(['0', '1'])).toBeTruthy();

        expect(Types.isArrayOfString(['0', 1])).toBeFalsy();
    });

    it('should make array check', () => {
        expect(Types.isArray([])).toBeTruthy();
        expect(Types.isArray([0])).toBeTruthy();

        expect(Types.isArray({})).toBeFalsy();
    });

    it('should make object check', () => {
        expect(Types.isObject({})).toBeTruthy();
        expect(Types.isObject({ v: 1 })).toBeTruthy();

        expect(Types.isObject([])).toBeFalsy();
    });

    it('should make Map check', () => {
        expect(Types.isMap(new Map())).toBeTruthy();

        expect(Types.isMap({})).toBeFalsy();
    });

    it('should make Set check', () => {
        expect(Types.isSet(new Set())).toBeTruthy();

        expect(Types.isSet({})).toBeFalsy();
    });

    it('should make RegExp check', () => {
        expect(Types.isRegExp(/[.*]/)).toBeTruthy();

        expect(Types.isRegExp('/[.*]/')).toBeFalsy();
    });

    it('should make Date check', () => {
        expect(Types.isDate(new Date())).toBeTruthy();

        expect(Types.isDate(new Date().getDate())).toBeFalsy();
    });

    it('should make undefined check', () => {
        expect(Types.isUndefined(undefined)).toBeTruthy();

        expect(Types.isUndefined(null)).toBeFalsy();
    });

    it('should make null check', () => {
        expect(Types.isNull(null)).toBeTruthy();

        expect(Types.isNull(undefined)).toBeFalsy();
    });

    it('should make function check', () => {
        expect(Types.isFunction(() => { /* NOOP */ })).toBeTruthy();

        expect(Types.isFunction([])).toBeFalsy();
    });

    it('should make type check', () => {
        expect(Types.is(new MyClass(1), MyClass)).toBeTruthy();

        expect(Types.is(1, MyClass)).toBeFalsy();
    });

    it('should compare undefined', () => {
        expect(Types.equals(undefined, undefined)).toBeTruthy();
    });

    it('should compare null', () => {
        expect(Types.equals(null, null)).toBeTruthy();
    });

    it('should compare invalid', () => {
        expect(Types.equals(null, undefined)).toBeFalsy();
    });

    it('should compare scalars', () => {
        expect(Types.equals(1, false)).toBeFalsy();
        expect(Types.equals(1, 2)).toBeFalsy();
        expect(Types.equals(2, 2)).toBeTruthy();
    });

    it('should compare arrays', () => {
        expect(Types.equals([1, 2], [2, 3])).toBeFalsy();
        expect(Types.equals([1, 2], [1, 2])).toBeTruthy();
    });

    it('should compare objects', () => {
        expect(Types.equals({ a: 1, b: 2 }, { a: 2, b: 3 })).toBeFalsy();
        expect(Types.equals({ a: 1, b: 2 }, { b: 2, a: 1 })).toBeTruthy();
    });

    it('should compare maps', () => {
        expect(Types.equals(new Map([['a', 1], ['b', 2]]), new Map([['a', 1], ['b', 3]]))).toBeFalsy();
        expect(Types.equals(new Map([['a', 1], ['b', 2]]), new Map([['b', 2], ['a', 1]]))).toBeTruthy();
    });

    it('should compare sets', () => {
        expect(Types.equals(new Set([1, 2]), new Set([2, 3]))).toBeFalsy();
        expect(Types.equals(new Set([1, 2]), new Set([2, 1]))).toBeTruthy();
    });

    it('should compare nested objects', () => {
        expect(Types.equals({ a: [1, 2] }, { a: [2, 3] })).toBeFalsy();
        expect(Types.equals({ a: [1, 2] }, { a: [1, 2] })).toBeTruthy();
    });

    it('should compare value objects', () => {
        const lhs = { value: 1, equals: () => true };
        const rhs = { value: 1, equals: () => true };

        expect(Types.equals(lhs, rhs)).toBeTruthy();
    });

    const FalsyValues = [false, null, 0];

    it('should compare empty string with undefined', () => {
        expect(Types.equals('', undefined, { lazyString: true })).toBeTruthy();
        expect(Types.equals('', undefined)).toBeFalsy();

        expect(Types.equals(undefined, '', { lazyString: true })).toBeTruthy();
        expect(Types.equals(undefined, '')).toBeFalsy();
    });

    FalsyValues.forEach(x => {
        it('should compare empty string with {x}', () => {
            expect(Types.equals('', x, { lazyString: true })).toBeFalsy();
            expect(Types.equals('', x)).toBeFalsy();

            expect(Types.equals(x, '', { lazyString: true })).toBeFalsy();
            expect(Types.equals(x, '')).toBeFalsy();
        });
    });
});

class MyClass {
    constructor(
        public readonly value: number,
    ) {
    }
}
