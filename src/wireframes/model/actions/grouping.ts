/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ActionReducerMapBuilder, createAction } from '@reduxjs/toolkit';
import { MathHelper } from '@app/core/utils';
import { EditorState } from './../internal';
import { createItemsAction, DiagramRef, ItemsRef } from './utils';

export const groupItems =
    createAction('grouping/group', (diagram: DiagramRef, items: ItemsRef, groupId?: string) => {
        return { payload: createItemsAction(diagram, items, { groupId: groupId || MathHelper.nextId() }) };
    });

export const ungroupItems =
    createAction('grouping/ungroup', (diagram: DiagramRef, groups: ItemsRef) => {
        return { payload: createItemsAction(diagram, groups) };
    });

export function buildGrouping(builder: ActionReducerMapBuilder<EditorState>) {
    return builder
        .addCase(groupItems, (state, action) => {
            const { diagramId, groupId, itemIds } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                return diagram.group(groupId, itemIds).selectItems([groupId]);
            });
        })
        .addCase(ungroupItems, (state, action) => {
            const { diagramId, itemIds } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                const childIds: string[] = [];

                for (const groupId of itemIds) {
                    const target = diagram.items.get(groupId);

                    if (target) {
                        childIds.push(...target.childIds.values);

                        diagram = diagram.ungroup(groupId);
                    }
                }

                diagram = diagram.selectItems(childIds);

                return diagram;
            });
        });
}
