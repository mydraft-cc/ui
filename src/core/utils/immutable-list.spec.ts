import { ImmutableList } from '@app/core';

describe('ImmutableList', () => {
    it('should instantiate without arguments', () => {
        const list = ImmutableList.empty<number>();

        expect(list.size).toBe(0);
    });

    it('should cache empty instance', () => {
        const list = ImmutableList.of(...[]);

        expect(list).toBe(ImmutableList.empty());
    });

    it('should instantiate from array of items', () => {
        const list_1 = ImmutableList.of(1, 2, 3);

        expect(list_1.size).toBe(3);
        expect(list_1.at(0)).toBe(1);
        expect(list_1.at(1)).toBe(2);
        expect(list_1.at(2)).toBe(3);
    });

    it('should add values', () => {
        const list_1 = ImmutableList.empty<number>();
        const list_2 = list_1.add(1);
        const list_3 = list_2.add(2, 3);

        expect(list_3.values).toEqual([1, 2, 3]);
    });

    it('should original list when values to add is null', () => {
        const items: number[] = null;

        const list_1 = ImmutableList.empty<number>();
        const list_2 = list_1.add(...items);

        expect(list_2).toEqual(list_1);
    });

    it('should original list when values to add is empty', () => {
        const list_1 = ImmutableList.empty<number>();
        const list_2 = list_1.add();

        expect(list_2).toEqual(list_1);
    });

    it('should return undefined for invalid index', () => {
        const list_1 = ImmutableList.of(1);

        expect(list_1.at(-1)).toBeUndefined();
    });

    it('should remove values', () => {
        const list_1 = ImmutableList.of(1, 2, 3, 4);
        const list_2 = list_1.remove(2, 3);

        expect(list_2.values).toEqual([1, 4]);
    });

    it('should return original list when item to remove is null', () => {
        const items: string[] = null;

        const list_1 = ImmutableList.of(1);
        const list_2 = list_1.remove(...items);

        expect(list_2).toBe(list_1);
    });

    it('should return original list when item to remove is empty', () => {
        const list_1 = ImmutableList.of(1);
        const list_2 = list_1.remove();

        expect(list_2).toBe(list_2);
    });

    it('should return original list when item to remove does not exists', () => {
        const list_1 = ImmutableList.of(1);
        const list_2 = list_1.remove(3);

        expect(list_2).toBe(list_1);
    });

    it('should bring to front', () => {
        const list_1 = ImmutableList.of(1, 2, 3, 4, 5, 6);
        const list_2 = list_1.bringToFront([3, 5]);

        expect(list_2.values).toEqual([1, 2, 4, 6, 3, 5]);
    });

    it('should bring forwards', () => {
        const list_1 = ImmutableList.of(1, 2, 3, 4, 5, 6);
        const list_2 = list_1.bringForwards([3, 4]);

        expect(list_2.values).toEqual([1, 2, 5, 3, 4, 6]);
    });

    it('should send to back', () => {
        const list_1 = ImmutableList.of(1, 2, 3, 4, 5, 6);
        const list_2 = list_1.sendToBack([4, 5]);

        expect(list_2.values).toEqual([4, 5, 1, 2, 3, 6]);
    });

    it('should send backwards', () => {
        const list_1 = ImmutableList.of(1, 2, 3, 4, 5, 6);
        const list_2 = list_1.sendBackwards([3, 5]);

        expect(list_2.values).toEqual([1, 3, 5, 2, 4, 6]);
    });

    it('should move item', () => {
        const list_1 = ImmutableList.of(1, 2, 3, 4, 5, 6);
        const list_2 = list_1.moveTo([3], 1);

        expect(list_2.values).toEqual([1, 3, 2, 4, 5, 6]);
    });

    it('should ignore items that are not found', () => {
        const list_1 = ImmutableList.of(1, 2, 3, 4, 5, 6);
        const list_2 = list_1.bringToFront([3, 'not found']);

        expect(list_2.values).toEqual([1, 2, 4, 5, 6, 3]);
    });

    it('should return original list no id to sort found', () => {
        const list_1 = ImmutableList.of(1, 2, 3, 5, 5, 6);
        const list_2 = list_1.sendBackwards(['not found']);

        expect(list_2).toBe(list_1);
    });

    it('should return original list when ids to sort is null', () => {
        const list_1 = ImmutableList.of(1, 2, 3, 4, 5, 6);
        const list_2 = list_1.sendBackwards(null!);

        expect(list_2).toBe(list_1);
    });

    it('should return true for equals when lists have same value in same order', () => {
        const list_a = ImmutableList.of(1, 2, 3);
        const list_b = ImmutableList.of(1, 2, 3);

        expect(list_a.equals(list_b)).toBeTruthy();
    });

    it('should return true for equals when lists are the same', () => {
        const list_a = ImmutableList.of(1, 2, 3);
        const list_b = list_a;

        expect(list_a.equals(list_b)).toBeTruthy();
    });

    it('should return false for equals when lists have different values', () => {
        const list_a = ImmutableList.of(1, 2, 3);
        const list_b = ImmutableList.of(1, 2, 4);

        expect(list_a.equals(list_b)).toBeFalsy();
    });

    it('should return false for equals when lists have different lengths', () => {
        const list_a = ImmutableList.of(1, 2, 3);
        const list_b = ImmutableList.of(1, 2);

        expect(list_a.equals(list_b)).toBeFalsy();
    });

    it('should return false for equals when checking with undefined value', () => {
        const list_a = ImmutableList.of(1, 2, 3);

        expect(list_a.equals(null!)).toBeFalsy();
    });
});
