import { Reducer } from 'redux';

import {
    Diagram,
    DiagramGroup,
    DiagramItem,
    EditorState
} from '@app/wireframes/model';

import { createItemsAction } from './utils';

export const GROUP_ITEMS = 'GROUP_ITEMS';
export const groupItems = (diagram: Diagram, items: DiagramItem[], groupId?: string) => {
    return createItemsAction(GROUP_ITEMS, diagram, items, { groupId });
};

export const UNGROUP_ITEMS = 'UNGROUP_ITEMS';
export const ungroupItems = (diagram: Diagram, groups: DiagramGroup[]) => {
    return createItemsAction(UNGROUP_ITEMS, diagram, groups);
};

export function grouping(): Reducer<EditorState> {
    const reducer: Reducer<EditorState> = (state: EditorState, action: any) => {
        switch (action.type) {
            case GROUP_ITEMS:
                return state.updateDiagram(action.payload.diagramId, diagram => {
                    const groupId = action.payload.groupId;

                    return diagram.group(action.payload.itemIds, groupId).selectItems([groupId]);
                });
            case UNGROUP_ITEMS:
                return state.updateDiagram(action.payload.diagramId, diagram => {
                    const childIds: string[] = [];

                    for (let groupId of action.payload.itemIds) {
                        const target = <DiagramGroup>diagram.items.get(groupId);

                        if (target) {
                            childIds.push(...target.childIds.toArray());

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