import { Action } from 'redux';

import { Types } from '@app/core';

import { Diagram, DiagramItem } from './../internal';

export type DiagramRef = string | Diagram;

export type ItemRef = string | DiagramItem;

export type ItemsRef = ItemRef[];

interface ItemsAction extends DiagramAction {
    readonly diagramId: string;
}

export function createItemsAction<T extends {}>(type: string, diagram: DiagramRef, items: ItemsRef, action?: T): T & Action & ItemsAction {
    let result: any = createDiagramAction(type, diagram, action);

    result.itemIds = items.map(itemOrId => {
        if (Types.isString(itemOrId)) {
            return itemOrId;
        } else {
            return itemOrId.id;
        }
    });

    return result;
}

interface DiagramAction {
    readonly diagramId: string;
}

export function createDiagramAction<T extends {}>(type: string, diagram: DiagramRef, action?: T): T & Action<string> & DiagramAction {
    const result: any = { type };

    if (diagram instanceof Diagram) {
        result.diagramId = diagram.id;
    } else {
        result.diagramId = diagram;
    }

    if (action) {
        Object.assign(result, action);
    }

    return result;
}