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
        expect(array.indexOf('a') >= 0).toBeTruthy();
        expect(array.indexOf('b') >= 0).toBeTruthy();
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
});
