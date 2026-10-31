/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { describe, expect, it } from 'vitest';
import { reorder } from './reorder';

describe('reorder', () => {
    function apply(current: string[], desired: string[]) {
        const result = [...current];
        const moved: string[] = [];

        reorder(current, desired, (id, nextId) => {
            result.splice(result.indexOf(id), 1);
            result.splice(nextId ? result.indexOf(nextId) : result.length, 0, id);
            moved.push(id);
        });

        return { result, moved };
    }

    it('should not move items when order is unchanged', () => {
        const { moved } = apply(['a', 'b', 'c'], ['a', 'b', 'c']);

        expect(moved).toEqual([]);
    });

    it('should move only one item when item is brought to front', () => {
        const { result, moved } = apply(['a', 'b', 'c', 'd'], ['b', 'c', 'd', 'a']);

        expect(result).toEqual(['b', 'c', 'd', 'a']);
        expect(moved).toEqual(['a']);
    });

    it('should produce desired order when order is shuffled', () => {
        const { result, moved } = apply(['a', 'b', 'c', 'd', 'e', 'f'], ['f', 'b', 'a', 'd', 'c', 'e']);

        expect(result).toEqual(['f', 'b', 'a', 'd', 'c', 'e']);
        expect(moved.length).toBe(3);
    });
});
