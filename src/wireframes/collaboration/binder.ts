/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import type * as Y from 'yjs';
import { createYjsReduxBinder } from 'yjs-redux';
import { createSyncOptions } from './resolvers';

// The name of the redux slice and of the root type in the yjs document.
export const EDITOR_SLICE = 'editor';

export const binder = createYjsReduxBinder(createSyncOptions());

export function hasEditorState(document: Y.Doc) {
    // Check the share first, because getMap would create the root type and the binder would treat it as remote state.
    return document.share.has(EDITOR_SLICE) && document.getMap(EDITOR_SLICE).size > 0;
}
