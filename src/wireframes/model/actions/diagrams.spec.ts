import {
    addDiagram,
    Diagram,
    diagrams,
    EditorState,
    removeDiagram,
    selectDiagram
} from '@app/wireframes/model';

describe('DiagramReducer', () => {
    const reducer = diagrams();

    it('should return same state if action is unknown', () => {
        const action = { type: 'UNKNOWN' };

        const state_1 = EditorState.empty();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should add diagram', () => {
        const action = addDiagram('1');

        const state_1 = EditorState.empty();
        const state_2 = reducer(state_1, action);

        expect(state_2.diagrams.size).toBe(1);
        expect(state_2.diagrams.get('1').id).toBe('1');
        expect(state_2.selectedDiagramId).toBe('1');
    });

    it('should select diagram', () => {
        const diagram = Diagram.empty('1');

        const action = selectDiagram(diagram);

        const state_1 = EditorState.empty().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        expect(state_2.selectedDiagramId).toBe(diagram.id);
    });

    it('should remove diagram', () => {
        const diagram = Diagram.empty('1');

        const action = removeDiagram(diagram);

        const state_1 = EditorState.empty().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        expect(state_2.diagrams.size).toBe(0);
    });
});