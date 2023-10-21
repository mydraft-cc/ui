/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { AnyAction } from 'redux';
import { Types } from '@app/core/utils';
import { changeItemsAppearance, transformItems } from './appearance';
import { changeColor, changeSize, renameDiagram } from './diagrams';
import { renameItems, selectItems } from './items';

export function mergeAction(action: AnyAction, prevAction: AnyAction): AnyAction | null {
    if (action.type !== prevAction.type) {
        return null;
    }

    const { diagramId, itemIds, timestamp } = action.payload;

    if (!Types.isString(diagramId) || !Types.isNumber(timestamp)) {
        return null;
    }

    const previousTimestamp = prevAction.payload.timestamp;

    if (timestamp - previousTimestamp > 500) {
        return null;
    }

    if (!Types.equals(prevAction.payload.diagramId, diagramId)) {
        return null;
    }

    if (selectItems.match(prevAction)) {
        return action;
    }

    if (!Types.equals(prevAction.payload.itemIds, itemIds)) {
        return null;
    }

    if (transformItems.match(prevAction)) {
        return { type: action.type, payload: { ...action.payload, oldBounds: prevAction.payload.oldBounds } };
    }

    if (changeColor.match(prevAction) ||
        changeSize.match(prevAction) ||
        renameDiagram.match(prevAction) ||
        renameItems.match(prevAction)) {
        return action;
    }

    if (changeItemsAppearance.match(prevAction) && prevAction.payload.appearance === action.payload.appearance) {
        return action;
    }

    return null;
}