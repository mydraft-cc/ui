/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Color, MathHelper } from '@app/core';

export type User = { id: string; color: string; initial: string };
export const user = getUser();

function getUser() {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
        return JSON.parse(storedUser) as User;
    }

    const userValue = { id: MathHelper.guid(), initial: getRandomInitial(), color: getRandomColor() };
    const userJson = JSON.stringify(userValue, undefined, 2);

    localStorage.setItem('user', userJson);
    
    return userValue;
}

function getRandomInitial(length = 2): string {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    let randomInitial = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * alphabet.length);

        randomInitial += alphabet.charAt(randomIndex);
    }

    return randomInitial;
}

function getRandomColor() {
    const colorHash = Math.random() * 360; 
    const colorValue = Color.fromHsv(colorHash, 0.6, 0.7);

    return colorValue.toString();
}