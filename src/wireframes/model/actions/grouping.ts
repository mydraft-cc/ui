import { Reducer } from 'redux';

import {
    Diagram,
    DiagramGroup,
    DiagramItem,
    EditorState
} from '@app/wireframes/model';

import { createItemsAction } from './utils';

export const GROUP = 'GROUP';
export const group = (diagram: Diagram, items: DiagramItem[], groupId?: string) => {
    return createItemsAction(GROUP, diagram, items, { groupId });
};

export const UNGROUP = 'UNGROUP';
export const ungroup = (diagram: Diagram, groups: DiagramGroup[]) => {
    return createItemsAction(UNGROUP, diagram, groups);
};

export function grouping(): Reducer<EditorState> {
    const reducer: Reducer<EditorState> = (state: EditorState, action: any) => {
        switch (action.type) {
            case GROUP:
                return state.updateDiagram(action.payload.diagramId, diagram => {
                    const groupId = action.payload.groupId;

                    return diagram.group(action.payload.itemIds, groupId).selectItems([groupId]);
                });
            case UNGROUP:
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