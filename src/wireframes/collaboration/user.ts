/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Color, MathHelper } from '@app/core/utils';

export type User = { id: string; color: string; initial: string };

const STORAGE_KEY = 'user';

export const user = getUser();

function getUser(): User {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (stored) {
            const parsed = JSON.parse(stored) as User;

            if (parsed?.id && parsed.color && parsed.initial) {
                return parsed;
            }
        }
    } catch {
        // Storage might not be available, e.g. in private mode.
    }

    const created: User = {
        id: MathHelper.guid(),
        color: Color.fromHsv(Math.random() * 360, 0.6, 0.7).toString(),
        initial: getRandomInitial(),
    };

    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(created));
    } catch {
        // Storage might not be available, e.g. in private mode.
    }

    return created;
}

function getRandomInitial(length = 2) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let result = '';

    for (let i = 0; i < length; i++) {
        result += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }

    return result;
}
