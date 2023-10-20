/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ColorPalette } from '@app/core/utils';

describe('ColorPalatte', () => {
    it('should generate colors', () => {
        const palette = ColorPalette.colors();

        expect(palette.colors.length).toBeGreaterThan(20);
    });
});
