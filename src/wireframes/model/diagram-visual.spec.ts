import * as Immutable from 'immutable';

import { MathHelper } from '@app/core';

import { DiagramShape } from '@app/wireframes/model';

describe('DiagramVisual', () => {
    const visual_1 = DiagramShape.createShape(MathHelper.guid(), 'btn', 100, 20);

    it('should add appearance', () => {
        const visual_2 = visual_1.setAppearance('color', 33);

        expect(visual_2.appearance.get('color')).toBe(33);
    });

    it('should return original visual when setting appearance with null key', () => {
        const visual_2 = visual_1.setAppearance(null!, 13);

        expect(visual_2).toBe(visual_1);
    });

    it('should replace appearance', () => {
        const visual_2 = visual_1.setAppearance('color', 13);
        const visual_3 = visual_2.setAppearance('color', 42);

        expect(visual_3.appearance.get('color')).toBe(42);
    });

    it('should return original visual when appearance to set has same value', () => {
        const visual_2 = visual_1.setAppearance('color', 13);
        const visual_3 = visual_2.setAppearance('color', 13);

        expect(visual_3).toBe(visual_2);
    });

    it('should return original visual when key to set is null', () => {
        const visual_2 = visual_1.setAppearance('color', 13);
        const visual_3 = visual_2.unsetAppearance(null!);

        expect(visual_3).toBe(visual_2);
    });

    it('should remove appearance', () => {
        const visual_2 = visual_1.setAppearance('color', 13);
        const visual_3 = visual_2.unsetAppearance('color');

        expect(visual_3.appearance.get('color')).toBeUndefined();
    });

    it('should return original visual when key to remove does not exist', () => {
        const visual_2 = visual_1.unsetAppearance('color');

        expect(visual_2).toBe(visual_1);
    });

    it('should return original visual when resetting appearance to null', () => {
        const visual_2 = visual_1.replaceAppearance(null!);

        expect(visual_2).toBe(visual_1);
    });

    it('should replace appearance', () => {
        const appearance = Immutable.Map<string, any>();

        const visual_2 = visual_1.replaceAppearance(appearance);

        expect(visual_2.appearance).toBe(appearance);
    });
});
