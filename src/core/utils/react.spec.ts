/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { sizeInPx } from '@app/core/utils';

describe('React Helpers', () => {
    it('should convert number to pixels', () => {
        expect(sizeInPx(10)).toEqual('10px');
    });
});
