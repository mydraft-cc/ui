/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Types } from '@app/core';

beforeAll(() => {
    expect.extend({
        toHaveSize(received: any, expected: number) {
            if (!isIterable(received)) {
                return {
                    message: () => 'Value must be iterable',
                    pass: false,
                };
            }

            const actualLength = Array.from(received).length;

            const pass = actualLength === expected;

            const message = pass 
                ? () => 'Iterable size match.'
                : () => 'Iterable size does not match.';

            return { pass, message, actual: actualLength, expected };
        },

        toBeSequence(received: any, expected: Iterable<any>) {
            if (!isIterable(received)) {
                return {
                    message: () => 'Value must be iterable',
                    pass: false,
                };
            }

            const itemsActual = Array.from(received);
            const itemsExpected = Array.from(expected);

            const pass = Types.equalsArray(itemsActual, itemsExpected);

            const message = pass 
                ? () => 'Iterable items match.'
                : () => 'Iterable items do not match.';

            return { pass, message, actual: itemsActual, expected: itemsExpected };
        },
    });
});

function isIterable(source: any) {
    return source && typeof source[Symbol.iterator] === 'function';
}