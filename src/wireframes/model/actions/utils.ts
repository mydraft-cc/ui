/*
 * Notifo.io
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Types } from '@app/core';
import { Action } from 'redux';
import { Diagram, DiagramItem } from './../internal';

export type DiagramRef = string | Diagram;
export type ItemRef = string | DiagramItem;
export type ItemsRef = ItemRef[];

interface ItemsAction extends DiagramAction {
    readonly diagramId: string;
}

export function createItemsAction<T extends {}>(type: string, diagram: DiagramRef, items: ItemsRef, action?: T): T & Action & ItemsAction {
    const result: any = createDiagramAction(type, diagram, action);

    result.itemIds = [];

    for (const itemOrId of items) {
        if (Types.isString(itemOrId)) {
            result.itemIds.push(itemOrId);
        } else {
            result.itemIds.push(itemOrId.id);
        }
    }

    return result;
}

interface DiagramAction {
    readonly diagramId: string;
}

export function createDiagramAction<T extends {}>(type: string, diagram: DiagramRef, action?: T): T & Action<string> & DiagramAction {
    const result: any = { type };

    if (Types.is(diagram, Diagram)) {
        result.diagramId = diagram.id;
    } else {
        result.diagramId = diagram;
    }

    if (action) {
        Object.assign(result, action);
    }

    return result;
}
