/*
 * Notifo.io
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper } from '@app/core';
import { Reducer } from 'redux';
import { Diagram, EditorState } from './../internal';
import { createItemsAction, DiagramRef, ItemsRef } from './utils';

export const GROUP_ITEMS = 'GROUP_ITEMS';
export const groupItems = (diagram: DiagramRef, items: ItemsRef, groupId?: string) => {
    return createItemsAction(GROUP_ITEMS, diagram, items, { groupId: groupId || MathHelper.guid() });
};

export const UNGROUP_ITEMS = 'UNGROUP_ITEMS';
export const ungroupItems = (diagram: Diagram, groups: ItemsRef) => {
    return createItemsAction(UNGROUP_ITEMS, diagram, groups);
};

export function grouping(): Reducer<EditorState> {
    const reducer: Reducer<EditorState> = (state: EditorState, action: any) => {
        switch (action.type) {
            case GROUP_ITEMS:
                return state.updateDiagram(action.diagramId, diagram => {
                    const groupId = action.groupId;

                    return diagram.group(groupId, action.itemIds).selectItems([groupId]);
                });
            case UNGROUP_ITEMS:
                return state.updateDiagram(action.diagramId, diagram => {
                    const childIds: string[] = [];

                    for (const groupId of action.itemIds) {
                        const target = diagram.items.get(groupId);

                        if (target) {
                            childIds.push(...target.childIds.values);

                            diagram = diagram.ungroup(groupId);
                        }
                    }

                    diagram = diagram.selectItems(childIds);

                    return diagram;
                });
            default:
                return state;
        }
    };

    return reducer;
}
