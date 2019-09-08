import { Record } from '@app/core';

class MockupObject extends Record<{ property1: string, property2: string }> {}

describe('ImmutableObject', () => {
    it('should create new instance on update', () => {
        const record_1 = new MockupObject({ property1: 'old1', property2: 'old2' });

        expect(record_1.get('property1')).toBe('old1');
        expect(record_1.get('property2')).toBe('old2');
    });
});
