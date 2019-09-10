import { Record, Vec2 } from '@app/core';

class MockupObject extends Record<{ n: number, vec: Vec2 }> {}

describe('ImmutableObject', () => {
    it('should create new instance on update', () => {
        const record_1 = new MockupObject({ n: 1 });

        expect(record_1.get('n')).toBe(1);
    });

    it('should update property', () => {
        const record_1 = new MockupObject({ n: 1 });
        const record_2 = record_1.set('n', 2);

        expect(record_2.get('n')).toBe(2);
    });

    it('should update property with merge', () => {
        const record_1 = new MockupObject({ n: 1 });
        const record_2 = record_1.merge({ n: 2 });

        expect(record_2.get('n')).toBe(2);
    });

    it('should return original record when value has not changed', () => {
        const record_1 = new MockupObject({ n: 1 });
        const record_2 = record_1.set('n', 1);

        expect(record_2).toBe(record_1);
    });

    it('should return original record when complex value has not changed', () => {
        const record_1 = new MockupObject({ n: 1, vec: new Vec2(1, 1) });
        const record_2 = record_1.set('vec', new Vec2(1, 1));

        expect(record_2).toBe(record_1);
    });
});
