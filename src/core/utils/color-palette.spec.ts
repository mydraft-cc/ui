import { ColorPalette } from '@app/core';

describe('ColorPalatte', () => {
    it('should generate colors', () => {
        const palette = ColorPalette.colors();

        expect(palette.colors.length).toBeGreaterThan(20);
    });
});
