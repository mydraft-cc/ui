import { Reducer } from 'redux';

import { Types } from '@app/core';

import {
    DiagramItemSet,
    EditorState,
    RendererService,
    Transform
} from './../internal';

import {
    createItemsAction,
    DiagramRef,
    ItemsRef
} from './utils';

export const CHANGE_ITEMS_APPEARANCE = 'CHANGE_ITEMS_APPEARANCE';
export const changeItemsAppearance = (diagram: DiagramRef, visuals: ItemsRef, key: string, value: any) => {
    return createItemsAction(CHANGE_ITEMS_APPEARANCE, diagram, visuals, { appearance: { key, value } });
};

export const TRANSFORM_ITEMS = 'TRANSFORM_ITEMS';
export const transformItems = (diagram: DiagramRef, items: ItemsRef, oldBounds: Transform, newBounds: Transform) => {
    return createItemsAction(TRANSFORM_ITEMS, diagram, items, { oldBounds: oldBounds.toJS(), newBounds: newBounds.toJS() });
};

export function appearance(rendererService: RendererService): Reducer<EditorState> {
    const editorReducer: Reducer<EditorState> = (state: EditorState, action: any) => {
        switch (action.type) {
            case CHANGE_ITEMS_APPEARANCE:
                return state.updateDiagram(action.diagramId, diagram => {
                    const { key, value } = action.appearance;

                    const set = DiagramItemSet.createFromDiagram(action.itemIds, diagram);

                    for (let visual of set!.allVisuals) {
                        diagram = diagram.updateItem(visual.id, item => {
                            if (item.type === 'Shape') {
                                const renderer = rendererService.registeredRenderers[item.renderer];

                                if (renderer && !Types.isUndefined(renderer.defaultAppearance()[key])) {
                                    return item.setAppearance(key, value);
                                }
                            }

                            return item;
                        });
                    }

                    return diagram;
                });
            case TRANSFORM_ITEMS:
                return state.updateDiagram(action.diagramId, diagram => {
                    const oldBounds = Transform.fromJS(action.oldBounds);
                    const newBounds = Transform.fromJS(action.newBounds);

                    const set = DiagramItemSet.createFromDiagram(action.itemIds, diagram);

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