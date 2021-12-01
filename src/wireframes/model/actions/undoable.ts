/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { createAction } from '@reduxjs/toolkit';
import { Reducer } from 'redux';
import { UndoableState } from './../internal';
import { createClassReducer } from './utils';

export const undo =
    createAction('undo');

export const redo =
    createAction('redo');

export function undoable<T>(reducer: Reducer<T>, initialState: T, actionsToIgnore: string[], initialAction?: any) {
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
            } else if (actionsToIgnore && actionsToIgnore.indexOf(action.type) >= 0) {
                return state.replacePresent(newPresent);
            } else {
                return state.executed(newPresent, action);
            }
        }));
}
