import { Reducer } from 'redux';

import { Diagram, EditorState } from '@app/wireframes/model';

import { createDiagramAction } from './utils';

export const ADD_DIAGRAM = 'ADD_DIAGRAM';
export const addDiagram = (diagramId: string) => {
    return createDiagramAction(ADD_DIAGRAM, diagramId);
};

export const SELECT_DIAGRAM = 'SELECT_DIAGRAM';
export const selectDiagram = (diagram: Diagram) => {
    return createDiagramAction(SELECT_DIAGRAM, diagram);
};

export const REMOVE_DIAGRAM = 'REMOVE_DiAGRAM';
export const removeDiagram = (diagram: Diagram) => {
    return createDiagramAction(REMOVE_DIAGRAM, diagram);
};

export const MOVE_DIAGRAM = 'MOVE_DIAGRAM';
export const moveDiagram = (diagram: Diagram, position: number) => {
    return createDiagramAction(MOVE_DIAGRAM, diagram, { position });
};

export function diagrams(): Reducer<EditorState> {
    const reducer: Reducer<EditorState> = (state: EditorState, action: any) => {
        switch (action.type) {
            case SELECT_DIAGRAM:
                return state.selectDiagram(action.payload.diagramId);
            case ADD_DIAGRAM:
                return state.addDiagram(Diagram.createDiagram(action.payload.diagramId)).selectDiagram(action.payload.diagramId);
            case REMOVE_DIAGRAM:
                return state.removeDiagram(action.payload.diagramId);
            case MOVE_DIAGRAM:
                return state.moveDiagram(action.payload.diagramId, action.payload.position);
            default:
                return state;
        }
    };

    return reducer;
}