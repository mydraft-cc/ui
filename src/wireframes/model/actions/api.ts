import { AnyAction } from 'redux';

const API_URL = process.env.NODE_ENV === 'test_development' ? 'http://localhost:4000' : 'https://api.mydraft.cc';

export async function getDiagram(readToken: string) {
    const response = await fetch(`${API_URL}/${readToken}`);

    if (!response.ok) {
        throw Error('Failed to load diagram');
    }

    const actions: AnyAction[] = await response.json();

    return actions;
}

export async function putDiagram(readToken: string, writeToken: string, body: ReadonlyArray<AnyAction>) {
    const response = await fetch(`${API_URL}/${readToken}/${writeToken}`, {
        method: 'PUT',
        headers: {
            ContentType: 'text/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw Error('Failed to save diagram');
    }
}

export async function postDiagram(body: ReadonlyArray<AnyAction>)  {
    const response = await fetch(`${API_URL}/`, {
        method: 'POST',
        headers: {
            ContentType: 'text/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        throw Error('Failed to save diagram');
    }

    const json: { readToken: string; writeToken: string } = await response.json();

    return json;
}