/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ActionReducerMapBuilder, createAction } from '@reduxjs/toolkit';
import { EditorState } from './../internal';
import { createItemsAction, DiagramRef, ItemsRef } from './utils';

export enum OrderMode {
    BringToFront = 'BRING_TO_FRONT',
    BringForwards = 'BRING_FORWARDS',
    SendBackwards = 'SEND_BACKWARDS',
    SendToBack = 'SEND_TO_BACK',
}

export const orderItems =
    createAction('items/order', (mode: OrderMode, diagram: DiagramRef, items: ItemsRef) => {
        return { payload: createItemsAction(diagram, items, { mode }) };
    });

export function buildOrdering(builder: ActionReducerMapBuilder<EditorState>) {
    return builder
        .addCase(orderItems, (state, action) => {
            const { diagramId, itemIds, mode } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                switch (mode) {
                    case OrderMode.BringToFront:
                        return diagram.bringToFront(itemIds);
                    case OrderMode.BringForwards:
                        return diagram.bringForwards(itemIds);
                    case OrderMode.SendToBack:
                        return diagram.sendToBack(itemIds);
                    case OrderMode.SendBackwards:
                        return diagram.sendBackwards(itemIds);
                    default:
                        return diagram;
                }
            });
        });
}
