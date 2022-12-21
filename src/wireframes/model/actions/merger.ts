/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { AnyAction } from 'redux';
import { Types } from '@app/core';
import { transformItems } from './appearance';

export function mergeAction(action: AnyAction, prevAction: AnyAction): AnyAction | null {
    if (action.type !== prevAction.type) {
        return null;
    }

    const { diagramId, itemIds, timestamp } = action.payload;

    if (!Types.isString(diagramId) ||
        !Types.isNumber(timestamp)) {
        return null;
    }

    const previousTimestamp = prevAction.payload.timestamp;

    if (timestamp - previousTimestamp > 500) {
        return null;
    }

    if (!Types.equals(prevAction.payload.diagramId, diagramId) ||
        !Types.equals(prevAction.payload.itemIds, itemIds)) {
        return null;
    }

    if (transformItems.match(action) && transformItems.match(prevAction)) {
        return { type: action.type, payload: { ...action.payload, oldBounds: prevAction.payload.oldBounds } };
    }

    return action;
}