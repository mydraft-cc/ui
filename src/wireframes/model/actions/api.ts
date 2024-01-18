/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export async function getDiagram(readToken: string) {
    const response = await fetch(`${SERVER_URL}/${readToken}`);

    if (!response.ok) {
        throw Error('Failed to load diagram');
    }

    const stored = await response.json();

    return stored;
}

export async function putDiagram(readToken: string, writeToken: string, body: any) {
    const response = await fetch(`${SERVER_URL}/${readToken}/${writeToken}`, {
        method: 'PUT',
        headers: {
            ['Content-Type']: 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw Error('Failed to save diagram');
    }
}

export async function postDiagram(body: any)  {
    const response = await fetch(`${SERVER_URL}/`, {
        method: 'POST',
        headers: {
            ['Content-Type']: 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw Error('Failed to save diagram');
    }

    const json: { readToken: string; writeToken: string } = await response.json();

    return json;
}