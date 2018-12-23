import { Reducer } from 'redux';

import { UndoableState } from './../internal';

export const UNDO = 'UNDO';
export const undo = () => {
    return { type: UNDO };
};

export const REDO = 'REDO';
export const redo = () => {
    return { type: REDO };
};

export function undoable<T>(reducer: Reducer<T>, initialState: T, actionsToIgnore: string[], initialAction?: any): Reducer<UndoableState<T>> {
    const undoReducer: Reducer<UndoableState<T>> = (state: UndoableState<T>, action: any) => {
        switch (action.type) {
            case UNDO:
                return state.undo();
            case REDO:
                return state.redo();
            default:
                if (!state) {
                    return UndoableState.create(initialState, initialAction);
                } else {
                    const newPresent = reducer(state.present, action);

                    if (newPresent === state.present) {
                        return state;
                    } else if (actionsToIgnore && actionsToIgnore.indexOf(action.type) >= 0) {
                        return state.replacePresent(newPresent);
                    } else {
                        return state.executed(newPresent, action);
                    }
                }
        }
    };

    return undoReducer;
}