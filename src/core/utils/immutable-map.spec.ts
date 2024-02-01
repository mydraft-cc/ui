/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/naming-convention */

import { ImmutableMap } from '@app/core/utils';

describe('ImmutableMap', () => {
    it('should instantiate without arguments', () => {
        const map = ImmutableMap.empty<number>();

        expect(map.size).toBe(0);
    });

    it('should return empty instance if creating map from empty object', () => {
        const map = ImmutableMap.of({});

        expect(map).toBe(ImmutableMap.empty());
    });

    it('should add items', () => {
        const map_1 = ImmutableMap.empty<number>();
        const map_2 = map_1.set('1', 10);
        const map_3 = map_2.set('1', 10);
        const map_4 = map_3.set('2', 20);
        const map_5 = map_4.set('3', 30);

        expect(map_5.size).toBe(3);
        expect(map_5.has('1')).toBeTruthy();
        expect(map_5.has('2')).toBeTruthy();
        expect(map_5.has('3')).toBeTruthy();
    });

    it('should convert to keys', () => {
        const map_1 = ImmutableMap.of<number>({ 1: 10, 2: 20 });

        expect(map_1.keys).toEqual(['1', '2']);
    });

    it('should convert to values', () => {
        const map_1 = ImmutableMap.of<number>({ 1: 10, 2: 20 });

        expect(map_1.values).toEqual([10, 20]);
    });

    it('should return original set when key to add is null', () => {
        const map_1 = ImmutableMap.empty<number>();
        const map_2 = map_1.set(null!, 10);

        expect(map_2).toBe(map_1);
    });

    it('should return original set when item to add already has the same value', () => {
        const map_1 = ImmutableMap.empty<number>();
        const map_2 = map_1.set('1', 10);
        const map_3 = map_2.set('1', 10);

        expect(map_3).toBe(map_2);
    });

    it('should update item', () => {
        const map_1 = ImmutableMap.empty<number>();
        const map_2 = map_1.set('1', 10);
        const map_3 = map_2.update('1', x => x * x);

        expect(map_3.get('1')).toEqual(100);
    });

    it('should return original set when item to update is not found', () => {
        const map_1 = ImmutableMap.empty<number>();
        const map_2 = map_1.set('1', 10);
        const map_3 = map_2.update('unknown', x => x * x);

        expect(map_3).toBe(map_2);
    });

    it('should return original set when update returns same item', () => {
        const map_1 = ImmutableMap.empty<number>();
        const map_2 = map_1.set('1', 10);
        const map_3 = map_2.update('unknown', x => x);

        expect(map_3).toBe(map_2);
    });

    it('should update items', () => {
        const map_1 = ImmutableMap.empty<number>();
        const map_2 = map_1.set('1', 10);
        const map_3 = map_2.updateAll(x => x * x);

        expect(map_3.get('1')).toEqual(100);
    });

    it('should return original set when update returns same items', () => {
        const map_1 = ImmutableMap.empty<number>();
        const map_2 = map_1.set('1', 10);
        const map_3 = map_2.updateAll(x => x);

        expect(map_3).toBe(map_2);
    });

    it('should remove item', () => {
        const map_1 = ImmutableMap.empty<number>();
        const map_2 = map_1.set('1', 10);
        const map_3 = map_2.remove('1');

        expect(map_3.size).toBe(0);
    });

    it('should return original set when item to remove is not found', () => {
        const map_1 = ImmutableMap.empty<number>();
        const map_2 = map_1.set('1', 10);
        const map_3 = map_2.remove('unknown');

        expect(map_3).toBe(map_2);
    });

    it('should remove item', () => {
        const map_1 = ImmutableMap.of<number>({ 1: 10, 2: 20, 3: 30 });
        const map_2 = map_1.remove('2');

        expect(map_2.size).toBe(2);
        expect(map_2.has('1')).toBeTruthy();
        expect(map_2.has('3')).toBeTruthy();
    });

    it('should return original set when item to remove is null', () => {
        const map_1 = ImmutableMap.of<number>({ 1: 10, 2: 20 });
        const map_2 = map_1.remove(null!);

        expect(map_2).toBe(map_1);
    });

    it('should mutate map', () => {
        const map_1 = ImmutableMap.of<number>({ 1: 10, 2: 20, 3: 30 });
        const map_2 = map_1.mutate(m => {
            m.set('4', 4);
            m.remove('2');
            m.remove('3');
        });

        expect(map_2.size).toBe(2);
        expect(map_2.has('1')).toBeTruthy();
        expect(map_2.has('4')).toBeTruthy();
    });

    it('should return orginal set when nothing has been mutated', () => {
        const map_1 = ImmutableMap.of<number>({ 1: 10, 2: 20, 3: 30 });
        const map_2 = map_1.mutate(() => false);

        expect(map_2).toBe(map_1);
    });

    it('should return true for equals when maps have same values', () => {
        const map_a = ImmutableMap.of<number>({ 1: 10, 2: 20 });
        const map_b = ImmutableMap.of<number>({ 1: 10, 2: 20 });

        expect(map_a.equals(map_b)).toBeTruthy();
    });

    it('should return true for equals when maps have same values in different order', () => {
        const map_a = ImmutableMap.of<number>({ 1: 10, 2: 20 });
        const map_b = ImmutableMap.of<number>({ 2: 20, 1: 10 });

        expect(map_a.equals(map_b)).toBeTruthy();
    });

    it('should return for equals when maps are the same', () => {
        const map_a = ImmutableMap.of<number>({ 1: 10, 2: 20, 3: 30 });
        const map_b = map_a;

        expect(map_a.equals(map_b)).toBeTruthy();
    });

    it('should return false for equals when maps have different keys', () => {
        const map_a = ImmutableMap.of<number>({ 1: 10 });
        const map_b = ImmutableMap.of<number>({ 2: 10 });

        expect(map_a.equals(map_b)).toBeFalsy();
    });

    it('should return false for equals when maps have different values', () => {
        const map_a = ImmutableMap.of<number>({ 1: 10 });
        const map_b = ImmutableMap.of<number>({ 1: 20 });

        expect(map_a.equals(map_b)).toBeFalsy();
    });

    it('should return false for equals when maps have different sizes', () => {
        const map_a = ImmutableMap.of<number>({ 1: 10 });
        const map_b = ImmutableMap.of<number>({ 1: 10, 2: 20 });

        expect(map_a.equals(map_b)).toBeFalsy();
    });

    it('should return false for equals when checking with undefined value', () => {
        const map_a = ImmutableMap.of<number>({ 1: 10 });

        expect(map_a.equals(null!)).toBeFalsy();
    });
});
