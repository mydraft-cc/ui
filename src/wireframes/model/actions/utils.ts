import { Action } from 'redux';

import { Diagram, DiagramItem } from '@app/wireframes/model';

export type DiagramRef = string | Diagram;

export type ItemsRef = string[] | DiagramItem[];

interface ItemsAction extends DiagramAction {
    readonly diagramId: string;
}

export function createItemsAction<T extends {}>(type: string, diagram: DiagramRef, items: ItemsRef, payload?: T): T & Action & ItemsAction {
    let result: any = createDiagramAction(type, diagram, payload);

    const itemIds: string[] = [];

    for (let item of items) {
        if (item instanceof DiagramItem) {
            itemIds.push(item.id);
        } else {
            itemIds.push(item);
        }
    }

    result.itemIds = itemIds;

    return result;
}

interface DiagramAction {
    readonly diagramId: string;
}

export function createDiagramAction<T extends {}>(type: string, diagram: DiagramRef, payload?: T): T & Action & DiagramAction {
    const result: any = { type };

    if (diagram instanceof Diagram) {
        result.diagramId = diagram.id;
    } else {
        result.diagramId = diagram;
    }

    if (payload) {
        Object.assign(result, payload);
    }

    return result;
}