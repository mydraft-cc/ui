/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/naming-convention */

import { redo, undo, undoable, UndoableState } from '@app/wireframes/model';

describe('Undoable', () => {
    const state_1: UndoableState<number> =
        UndoableState.create(13)
            .executed(14)
            .executed(15)
            .undo();

    let reducerCalled = 0;
    let reducerValue = 0;

    const inner = (state: number | undefined) => {
        reducerCalled++;
        reducerValue = (state || 0) + 1;

        return reducerValue;
    };

    const noopInner = (state: number | undefined) => {
        reducerCalled++;

        return state || 0;
    };

    beforeEach(() => {
        reducerCalled = 0;
    });

    it('should call state for undo action', () => {
        const reducer = undoable(inner, 0);
        const state_2 = reducer(state_1, undo());

        expect(state_2.present).toBe(13);
        expect(reducerCalled).toBeFalsy();
    });

    it('should call state for redo action', () => {
        const reducer = undoable(inner, 0);
        const state_2 = reducer(state_1, redo());

        expect(state_2.present).toBe(15);
        expect(reducerCalled).toBeFalsy();
    });

    it('should return original state when inner reducer makes no chance', () => {
        const reducer = undoable(noopInner, 0);
        const state_2 = reducer(state_1, { type: 'OTHER' });

        expect(state_2).toBe(state_1);
        expect(reducerCalled).toEqual(1);
    });

    it('should call inner reducer for other action', () => {
        const reducer = undoable(inner, 0);
        const state_2 = reducer(state_1, { type: 'OTHER' });

        expect(state_2.present).toEqual(reducerValue);
        expect(reducerCalled).toEqual(1);
    });

    it('should call inner reducer for ignored action', () => {
        const reducer = undoable(inner, 0, { actionsToIgnore: ['OTHER'] });
        const state_2 = reducer(state_1, { type: 'OTHER' });

        expect(state_2.present).toEqual(reducerValue);
        expect(reducerCalled).toEqual(1);
    });

    it('should not merge actions when merger returns false', () => {
        const reducer = undoable(inner, 0, { actionMerger: () => null });
        const state_2 = reducer(state_1, { type: 'OTHER' });
        const state_3 = reducer(state_2, { type: 'OTHER' });

        expect(state_3.present).toEqual(reducerValue);
        expect(state_3.actions.length).toEqual(2);
        expect(reducerCalled).toEqual(2);
    });

    it('should merge actions when merger returns merged action', () => {
        const reducer = undoable(inner, 0, { actionMerger: () => ({ type: 'MERGED' }) });
        const state_2 = reducer(state_1, { type: 'OTHER' });
        const state_3 = reducer(state_2, { type: 'MERGED' });

        expect(state_3.present).toEqual(reducerValue);
        expect(state_3.actions.length).toEqual(1);
        expect(reducerCalled).toEqual(2);
    });

    it('should create valid undo action', () => {
        const action = undo();

        expect(action.type).toBe('undo');
    });

    it('should create valid redo action', () => {
        const action = redo();

        expect(action.type).toBe('redo');
    });
});
