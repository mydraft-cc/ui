import { Reducer } from 'redux';

import {
    EditorState
} from './../internal';

import {
    createItemsAction,
    DiagramRef,
    ItemsRef
} from './utils';

export const BRING_TO_FRONT = 'BRING_TO_FRONT';
export const BRING_FORWARDS = 'BRING_FORWARDS';
export const SEND_BACKWARDS = 'SEND_BACKWARDS';
export const SEND_TO_BACK = 'SEND_TO_BACK';

export const ORDER_ITEMS = 'ORDER_ITEMS';
export const orderItems = (mode: string, diagram: DiagramRef, items: ItemsRef) => {
    return createItemsAction(ORDER_ITEMS, diagram, items, { mode });
};

export function ordering(): Reducer<EditorState> {
    const reducer: Reducer<EditorState> = (state: EditorState, action: any) => {
        if (action.type === ORDER_ITEMS) {
            switch (action.mode) {
                case BRING_TO_FRONT:
                    return state.updateDiagram(action.diagramId, diagram => {
                        return diagram.bringToFront(action.itemIds);
                    });
                case BRING_FORWARDS:
                    return state.updateDiagram(action.diagramId, diagram => {
                        return diagram.bringForwards(action.itemIds);
                    });
                case SEND_TO_BACK:
                    return state.updateDiagram(action.diagramId, diagram => {
                        return diagram.sendToBack(action.itemIds);
                    });
                case SEND_BACKWARDS:
                    return state.updateDiagram(action.diagramId, diagram => {
                        return diagram.sendBackwards(action.itemIds);
                    });
                default:
                    return state;
            }
        }

        return state;
    };

    return reducer;
}