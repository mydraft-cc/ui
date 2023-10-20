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
    capacity?: number;
    actionsToIgnore?: string[];
    actionMerger?: (action: AnyAction, previous: AnyAction) => AnyAction | null | undefined;
    initialAction?: AnyAction;
};

export function undoable<T>(reducer: Reducer<T>, initialState: T, options?: Options) {
    const initialAction = options?.initialAction;
    const actionsToIgnore: Record<string, boolean> = {};
    const actionMerger = options?.actionMerger || (() => undefined);

    if (options?.actionsToIgnore) {
        for (const type of options.actionsToIgnore) {
            actionsToIgnore[type] = true;
        }
    }

    return createClassReducer(UndoableState.create(initialState, initialAction, options?.capacity), builder => builder
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
            } 
            
            if (actionsToIgnore[action.type]) {
                return state.replacePresent(newPresent);
            }
            
            if (state.lastAction) {
                const merged = actionMerger(action, state.lastAction);

                if (merged) {
                    return state.replacePresent(newPresent, merged);
                }
            }

            return state.executed(newPresent, action);
        }));
}
