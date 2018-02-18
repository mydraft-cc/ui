import { Reducer } from 'redux';

import {
    Diagram,
    DiagramItem,
    DiagramItemSet,
    DiagramVisual,
    EditorState,
    Transform
} from '@app/wireframes/model';

import { createItemsAction } from './utils';

export const CHANGE_ITEMS_APPEARANCE = 'CHANGE_ITEMS_APPEARANCE';
export const changeItemsAppearance = (diagram: Diagram, visuals: DiagramVisual[], key: string, val: any) => {
    return createItemsAction(CHANGE_ITEMS_APPEARANCE, diagram, visuals, { appearance: { key, val } });
};

export const TRANSFORM_ITEMS = 'TRANSFORM_ITEMS';
export const transformItems = (diagram: Diagram, items: DiagramItem[], oldBounds: Transform, newBounds: Transform) => {
    return createItemsAction(TRANSFORM_ITEMS, diagram, items, { oldBounds: oldBounds.toJS(), newBounds: newBounds.toJS() });
};

export function appearance(): Reducer<EditorState> {
    const editorReducer: Reducer<EditorState> = (state: EditorState, action: any) => {
        switch (action.type) {
            case CHANGE_ITEMS_APPEARANCE:
                return state.updateDiagram(action.payload.diagramId, diagram => {
                    const key = action.payload.appearance.key;
                    const val = action.payload.appearance.val;

                    const set = DiagramItemSet.createFromDiagram(action.payload.itemIds, diagram);

                    for (let visual of set!.allVisuals) {
                        diagram = diagram.updateItem(visual.id, i => (<DiagramVisual>i).setAppearance(key, val));
                    }

                    return diagram;
                });
            case TRANSFORM_ITEMS:
                return state.updateDiagram(action.payload.diagramId, diagram => {
                    const oldBounds = Transform.createFromJS(action.payload.oldBounds);
                    const newBounds = Transform.createFromJS(action.payload.newBounds);

                    const set = DiagramItemSet.createFromDiagram(action.payload.itemIds, diagram);

                    for (let item of set!.allItems) {
                        diagram = diagram.updateItem(item.id, i => i.transformByBounds(oldBounds, newBounds));
                    }

                    return diagram;
                });
            default:
                return state;
        }
    };

    return editorReducer;
}