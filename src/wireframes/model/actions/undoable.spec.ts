import {
    redo,
    undo,
    undoable,
    UndoableState
} from '@app/wireframes/model';

describe('Undoable', () => {
    const state_1: UndoableState<number> =
        UndoableState.create(13)
            .executed(14)
            .executed(15)
            .undo();

    it('should call state for undo action', () => {
        let reducerCalled = false;

        const reducer = undoable(s => { reducerCalled = true; return s || {}; }, {}, []);
        const state_2 = reducer(state_1, { type: 'UNDO' });

        expect(state_2.present).toBe(13);
        expect(reducerCalled).toBeFalsy();
    });

    it('should call state for redo action', () => {
        let reducerCalled = false;

        const reducer = undoable(s => { reducerCalled = true; return s || {}; }, {}, []);
        const state_2 = reducer(state_1, { type: 'REDO' });

        expect(state_2.present).toBe(15);
        expect(reducerCalled).toBeFalsy();
    });

    it('should return original state when inner reducer makes no chance', () => {
        let reducerCalled = false;

        const reducer = undoable(s => { reducerCalled = true; return s || {}; }, {}, []);
        const state_2 = reducer(state_1, { type: 'OTHER' });

        expect(state_2).toBe(state_1);
        expect(reducerCalled).toBeTruthy();
    });

    it('should call inner reducer for other action', () => {
        let reducerCalled = false;

        const reducer = undoable(() => { reducerCalled = true; return 16; }, 0, []);
        const state_2 = reducer(state_1, { type: 'OTHER' });

        expect(state_2.present).toBe(16);
        expect(reducerCalled).toBeTruthy();
    });

    it('should call inner reducer for ignored action', () => {
        let reducerCalled = false;

        const reducer = undoable(() => { reducerCalled = true; return 16; }, 0, ['OTHER']);
        const state_2 = reducer(state_1, { type: 'OTHER' });

        expect(state_2.present).toBe(16);
        expect(reducerCalled).toBeTruthy();
    });

    it('should create valid undo action', () => {
        const action = undo();

        expect(action.type).toBe('UNDO');
    });

    it('should create valid redo action', () => {
        const action = redo();

        expect(action.type).toBe('REDO');
    });
});
