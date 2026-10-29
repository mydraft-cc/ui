/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as Y from 'yjs';
import { MathHelper } from '@app/core/utils';
import { EditorState, getSaveState } from '@app/wireframes/model';
import { User } from './user';

// The name of the root type in the yjs document, separate from the editor slice so that versions are never part of the undo history.
export const VERSIONS_ROOT = 'versions';

export type Version = { id: string; name: string; created: number; author: User; content: string };

export function getVersions(document: Y.Doc): ReadonlyArray<Version> {
    return document.getArray<Version>(VERSIONS_ROOT).toArray();
}

export function addVersion(document: Y.Doc, name: string, editor: EditorState, author: User) {
    const version: Version = {
        id: MathHelper.guid(),
        name,
        created: Date.now(),
        author,
        content: JSON.stringify(getSaveState(editor)),
    };

    document.getArray<Version>(VERSIONS_ROOT).push([version]);

    return version;
}

export function removeVersion(document: Y.Doc, id: string) {
    const versions = document.getArray<Version>(VERSIONS_ROOT);
    const index = versions.toArray().findIndex(x => x.id === id);

    if (index >= 0) {
        versions.delete(index, 1);
    }
}

export function readVersion(version: Version) {
    return JSON.parse(version.content);
}
