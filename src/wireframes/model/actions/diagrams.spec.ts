import { MathHelper } from '@app/core'

import {
    addDiagram,
    diagrams,
    Diagram,
    EditorState,
    moveDiagram,
    removeDiagram,
    selectDiagram
} from '@app/wireframes/model';

describe('DiagramReducer', () => {
    const reducer = diagrams();

    it('should return same state if action is unknown', () => {
        const action = { type: 'UNKNOWN' };
        const state_1 = EditorState.createInitial();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should add diagram', () => {
        const diagramId = MathHelper.guid();

        const action = addDiagram(diagramId);
        const state_1 = EditorState.createInitial();
        const state_2 = reducer(state_1, action);

        expect(state_2.diagrams.size).toBe(1);
        expect(state_2.diagrams.last.id).toBe(diagramId);
    });

    it('should select diagram', () => {
        const diagram = Diagram.createDiagram();

        const action = selectDiagram(diagram);
        const state_1 = EditorState.createInitial().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        expect(state_2.selectedDiagramId).toBe(state_2.diagrams.last.id);
    });

    it('should remove diagram', () => {
        const diagram = Diagram.createDiagram();

        const action = removeDiagram(diagram);
        const state_1 = EditorState.createInitial().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        expect(state_2.diagrams.size).toBe(0);
    });

    it('should move diagram to new position', () => {
        const diagram1 = Diagram.createDiagram();
        const diagram2 = Diagram.createDiagram();

        const action = moveDiagram(diagram2, 0);
        const state_1 = EditorState.createInitial().addDiagram(diagram1).addDiagram(diagram2);
        const state_2 = reducer(state_1, action);

        expect(state_2.diagrams.map(d => d.id)).toEqual([ diagram2.id, diagram1.id ]);
    });
});