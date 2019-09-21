import { Reducer } from 'redux';

import { MathHelper, Vec2 } from '@app/core';

import { Diagram, EditorState } from './../internal';

import { createDiagramAction, DiagramRef } from './utils';

export const ADD_DIAGRAM = 'ADD_DIAGRAM';
export const addDiagram = (diagramId?: string) => {
    return createDiagramAction(ADD_DIAGRAM, diagramId || MathHelper.guid());
};

export const SELECT_DIAGRAM = 'SELECT_DIAGRAM';
export const selectDiagram = (diagram: DiagramRef) => {
    return createDiagramAction(SELECT_DIAGRAM, diagram);
};

export const REMOVE_DIAGRAM = 'REMOVE_DiAGRAM';
export const removeDiagram = (diagram: DiagramRef) => {
    return createDiagramAction(REMOVE_DIAGRAM, diagram);
};

export const CHANGE_SIZE = 'CHANGE_SIZE';
export const changeSize = (width: number, height: number) => {
    return { type: CHANGE_SIZE, width, height };
};

export function diagrams(): Reducer<EditorState> {
    const reducer: Reducer<EditorState> = (state: EditorState, action: any) => {
        switch (action.type) {
            case SELECT_DIAGRAM:
                return state.selectDiagram(action.diagramId);
            case ADD_DIAGRAM:
                return state.addDiagram(Diagram.empty(action.diagramId)).selectDiagram(action.diagramId);
            case REMOVE_DIAGRAM:
                return state.removeDiagram(action.diagramId);
            case CHANGE_SIZE:
                return state.changeSize(new Vec2(action.width, action.height));
            default:
                return state;
        }
    };

    return reducer;
}