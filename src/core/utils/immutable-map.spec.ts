import { ImmutableMap } from '@app/core';

describe('ImmutableMap', () => {
    it('should instantiate without arguments', () => {
        const list = ImmutableMap.empty<number>();

        expect(list.size).toBe(0);
    });

    it('should return empty instance if creating map from empty object', () => {
        const list = ImmutableMap.of({});

        expect(list).toBe(ImmutableMap.empty());
    });

    it('should add items', () => {
        const set_1 = ImmutableMap.empty<number>();
        const set_2 = set_1.set('1', 10);
        const set_3 = set_2.set('1', 10);
        const set_4 = set_3.set('2', 20);
        const set_5 = set_4.set('3', 30);

        expect(set_5.size).toBe(3);
        expect(set_5.has('1')).toBeTruthy();
        expect(set_5.has('2')).toBeTruthy();
        expect(set_5.has('3')).toBeTruthy();
    });

    it('should convert to key array', () => {
        const set_1 = ImmutableMap.of<number>({ 1: 10, 2: 20 });

        const array = set_1.keys;

        expect(array.length).toBe(2);
        expect(array).toContain('1');
        expect(array).toContain('2');
    });

    it('should convert to value array', () => {
        const set_1 = ImmutableMap.of<number>({ 1: 10, 2: 20 });

        const array = set_1.values;

        expect(array.length).toBe(2);
        expect(array).toContain(10);
        expect(array).toContain(20);
    });

    it('should return original set when key to add is null', () => {
        const set_1 = ImmutableMap.empty<number>();
        const set_2 = set_1.set(null!, 10);

        expect(set_2).toBe(set_1);
    });

    it('should return original set when item to add already has the same value', () => {
        const set_1 = ImmutableMap.empty<number>();
        const set_2 = set_1.set('1', 10);
        const set_3 = set_2.set('1', 10);

        expect(set_3).toBe(set_2);
    });

    it('should update item', () => {
        const set_1 = ImmutableMap.empty<number>();
        const set_2 = set_1.set('1', 10);
        const set_3 = set_2.update('1', x => x * x);

        expect(set_3.get('1')).toEqual(100);
    });

    it('should return original set when item to remove is not found', () => {
        const set_1 = ImmutableMap.empty<number>();
        const set_2 = set_1.set('1', 10);
        const set_3 = set_2.update('unknown', x => x * x);

        expect(set_3).toBe(set_2);
    });

    it('should return original set when update returns same item', () => {
        const set_1 = ImmutableMap.empty<number>();
        const set_2 = set_1.set('1', 10);
        const set_3 = set_2.update('unknown', x => x);

        expect(set_3).toBe(set_2);
    });

    it('should remove item', () => {
        const set_1 = ImmutableMap.empty<number>();
        const set_2 = set_1.set('1', 10);
        const set_3 = set_2.remove('1');

        expect(set_3.size).toBe(0);
    });

    it('should return original set when item to remove is not found', () => {
        const set_1 = ImmutableMap.empty<number>();
        const set_2 = set_1.set('1', 10);
        const set_3 = set_2.remove('unknown');

        expect(set_3).toBe(set_2);
    });

    it('should remove item', () => {
        const set_1 = ImmutableMap.of<number>({ 1: 10, 2: 20, 3: 30 });
        const set_2 = set_1.remove('2');

        expect(set_2.size).toBe(2);
        expect(set_2.has('1')).toBeTruthy();
        expect(set_2.has('3')).toBeTruthy();
    });

    it('should return original set when item to remove is null', () => {
        const set_1 = ImmutableMap.of<number>({ 1: 10, 2: 20 });
        const set_2 = set_1.remove(null!);

        expect(set_2).toBe(set_1);
    });

    it('should mutate set', () => {
        const set_1 = ImmutableMap.of<number>({ 1: 10, 2: 20, 3: 30 });
        const set_2 = set_1.mutate(m => {
            m.set('4', '4');
            m.remove('2');
            m.remove('3');
        });

        expect(set_2.size).toBe(2);
        expect(set_2.has('1')).toBeTruthy();
        expect(set_2.has('4')).toBeTruthy();
    });

    it('should return orginal set when nothing has been mutated', () => {
        const set_1 = ImmutableMap.of<number>({ 1: 10, 2: 20, 3: 30 });
        const set_2 = set_1.mutate(() => false);

        expect(set_2).toBe(set_1);
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