import { ImmutableSet } from '@app/core';

describe('ImmutableSet', () => {
    it('should instantiate instance from array', () => {
        const set_1 = ImmutableSet.of('1', '1', '2', '3');

        expect(set_1.size).toBe(3);
        expect(set_1.has('1')).toBeTruthy();
        expect(set_1.has('2')).toBeTruthy();
        expect(set_1.has('3')).toBeTruthy();
    });

    it('should return empty instance if creating map from empty array', () => {
        const list = ImmutableSet.of();

        expect(list).toBe(ImmutableSet.empty());
    });

    it('should add items', () => {
        const set_1 = ImmutableSet.empty();
        const set_2 = set_1.add('1');
        const set_3 = set_2.add('1');
        const set_4 = set_3.add('2');
        const set_5 = set_4.add('3');

        expect(set_5.size).toBe(3);
        expect(set_5.has('1')).toBeTruthy();
        expect(set_5.has('2')).toBeTruthy();
        expect(set_5.has('3')).toBeTruthy();
    });

    it('should convert to aray', () => {
        const set_1 = ImmutableSet.of('a', 'b');

        const array = set_1.values;

        expect(array.length).toBe(2);
        expect(array).toContain('a');
        expect(array).toContain('b');
    });

    it('should return original set when item to add is null', () => {
        const set_1 = ImmutableSet.empty();
        const set_2 = set_1.add(null!);

        expect(set_2).toBe(set_1);
    });

    it('should return original set when item to add already exists', () => {
        const set_1 = ImmutableSet.empty();
        const set_2 = set_1.add('1');
        const set_3 = set_2.add('1');

        expect(set_3).toBe(set_2);
    });

    it('should remove item', () => {
        const set_1 = ImmutableSet.empty();
        const set_2 = set_1.add('1');
        const set_3 = set_2.remove('1');

        expect(set_3.size).toBe(0);
    });

    it('should return original set when item to remove is not found', () => {
        const set_1 = ImmutableSet.empty();
        const set_2 = set_1.add('1');
        const set_3 = set_2.remove('unknown');

        expect(set_3).toBe(set_2);
    });

    it('should remove item', () => {
        const set_1 = ImmutableSet.of('1', '2', '3');
        const set_2 = set_1.remove('2');

        expect(set_2.size).toBe(2);
        expect(set_2.has('1')).toBeTruthy();
        expect(set_2.has('3')).toBeTruthy();
    });

    it('should return original set when item to remove is null', () => {
        const set_1 = ImmutableSet.of('1', '2', '3', '4');
        const set_2 = set_1.remove(null!);

        expect(set_2).toBe(set_1);
    });

    it('should mutate set', () => {
        const set_1 = ImmutableSet.of('1', '2', '3');
        const set_2 = set_1.mutate(m => {
            m.add('4');
            m.remove('2');
            m.remove('3');
        });

        expect(set_2.size).toBe(2);
        expect(set_2.has('1')).toBeTruthy();
        expect(set_2.has('4')).toBeTruthy();
    });

    it('should return orginal set when nothing has been mutated', () => {
        const set_1 = ImmutableSet.of('1', '2', '3');
        const set_2 = set_1.mutate(() => false);

        expect(set_2).toBe(set_1);
    });

    it('should return true for equals when sets have same value in same order', () => {
        const set_a = ImmutableSet.of('1', '2', '3');
        const set_b = ImmutableSet.of('1', '2', '3');

        expect(set_a.equals(set_b)).toBeTruthy();
    });

    it('should return true for equals when sets have same value in different order', () => {
        const set_a = ImmutableSet.of('1', '2', '3');
        const set_b = ImmutableSet.of('1', '3', '2');

        expect(set_a.equals(set_b)).toBeTruthy();
    });

    it('should return for equals when sets are the same', () => {
        const set_a = ImmutableSet.of('1', '2', '3');
        const set_b = set_a;

        expect(set_a.equals(set_b)).toBeTruthy();
    });

    it('should return false for equals when sets have different values', () => {
        const set_a = ImmutableSet.of('1', '2', '3');
        const set_b = ImmutableSet.of('1', '2', '4');

        expect(set_a.equals(set_b)).toBeFalsy();
    });

    it('should return false for equals when checking with undefined value', () => {
        const set_a = ImmutableSet.of('1', '2', '3');

        expect(set_a.equals(null!)).toBeFalsy();
    });
});
