/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { createAction } from '@reduxjs/toolkit';
import { AnyAction, Reducer } from 'redux';
import { UndoableState } from './../internal';
import { createClassReducer } from './utils';

export const undo =
    createAction('undo');

export const redo =
    createAction('redo');

type Options = {
    actionsToIgnore?: string[];
    actionMerger?: (action: AnyAction, previous: AnyAction) => boolean;
    initialAction?: AnyAction;
};

export function undoable<T>(reducer: Reducer<T>, initialState: T, options?: Options) {
    const initialAction = options?.initialAction;
    const actionsToIgnore = {};
    const actionMerger = options?.actionMerger || (() => false);

    if (options?.actionsToIgnore) {
        for (const type of options.actionsToIgnore) {
            actionsToIgnore[type] = true;
        }
    }

    return createClassReducer(UndoableState.create(initialState, initialAction), builder => builder
        .addCase(undo, state => {
            return state.undo();
        })
        .addCase(redo, state => {
            return state.redo();
        })
        .addDefaultCase((state, action) => {
            const newPresent = reducer(state.present as any, action);

            if (newPresent === state.present) {
                return state;
            } else if (actionsToIgnore[action.type]) {
                return state.replacePresent(newPresent);
            } else if (state.lastAction && actionMerger(action, state.lastAction)) {
                return state.replacePresent(newPresent, action);
            } else {
                return state.executed(newPresent, action);
            }
        }));
}
