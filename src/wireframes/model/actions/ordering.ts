import { Reducer } from 'redux';

import {
    Diagram,
    DiagramItem,
    EditorState
} from '@app/wireframes/model';

import { createItemsAction } from './utils';

export const BRING_TO_FRONT = 'BRING_TO_FRONT';
export const BRING_FORWARDS = 'BRING_FORWARDS';
export const SEND_BACKWARDS = 'SEND_BACKWARDS';
export const SEND_TO_BACK = 'SEND_TO_BACK';

export const ORDER_ITEMS = 'ORDER_ITEMS';
export const orderItems = (mode: string, diagram: Diagram, items: DiagramItem[]) => {
    return createItemsAction(ORDER_ITEMS, diagram, items, { mode });
};

export function ordering(): Reducer<EditorState> {
    const reducer: Reducer<EditorState> = (state: EditorState, action: any) => {
        if (action.type === ORDER_ITEMS) {
            switch (action.payload.mode) {
                case BRING_TO_FRONT:
                    return state.updateDiagram(action.payload.diagramId, diagram => {
                        return diagram.bringToFront(action.payload.itemIds);
                    });
                case BRING_FORWARDS:
                    return state.updateDiagram(action.payload.diagramId, diagram => {
                        return diagram.bringForwards(action.payload.itemIds);
                    });
                case SEND_TO_BACK:
                    return state.updateDiagram(action.payload.diagramId, diagram => {
                        return diagram.sendToBack(action.payload.itemIds);
                    });
                case SEND_BACKWARDS:
                    return state.updateDiagram(action.payload.diagramId, diagram => {
                        return diagram.sendBackwards(action.payload.itemIds);
                    });
                default:
                    return state;
            }
        }

        return state;
    };

    return reducer;
}