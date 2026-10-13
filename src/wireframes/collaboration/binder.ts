/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { createYjsReduxBinder } from 'yjs-redux';
import { createSyncOptions } from './resolvers';

// The name of the redux slice and of the root type in the yjs document.
export const EDITOR_SLICE = 'editor';

export const binder = createYjsReduxBinder(createSyncOptions());
