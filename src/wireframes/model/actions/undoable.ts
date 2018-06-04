import { Reducer } from 'redux';

import { UndoableState } from '@app/wireframes/model';

export const UNDO = 'UNDO';
export const undo: () => any = () => {
    return {
        type: UNDO
    };
};

export const REDO = 'REDO';
export const redo: () => any = () => {
    return {
        type: REDO
    };
};

export function undoable<T>(reducer: Reducer<T>, capacity: 20, initialState: T, actionsToIgnore: string[]): Reducer<UndoableState<T>> {
    const undoReducer: Reducer<UndoableState<T>> = (state: UndoableState<T>, action: any) => {
        switch (action.type) {
            case UNDO:
                return state.undo();
            case REDO:
                return state.redo();
            default:
                if (!state) {
                    return UndoableState.create(capacity, initialState);
                } else {
                    const newPresent = reducer(state.present, action);

                    if (newPresent === state.present) {
                        return state;
                    } else if (actionsToIgnore && actionsToIgnore.indexOf(action.type) >= 0) {
                        return state.replacePresent(newPresent, action);
                    } else {
                        return state.executed(newPresent, action);
                    }
                }
        }
    };

    return undoReducer;
}