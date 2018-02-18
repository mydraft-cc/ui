import { Diagram, DiagramItem } from '@app/wireframes/model';

export function createItemsAction(type: string, diagram: Diagram, items: string[] | DiagramItem[], payload?: {}): any {
    payload = payload || {};

    const itemIds: string[] = [];

    for (let item of items) {
        if (item instanceof DiagramItem) {
            itemIds.push(item.id);
        } else {
            itemIds.push(item);
        }
    }

    payload['itemIds'] = itemIds;

    return createDiagramAction(type, diagram, payload);
}

export function createDiagramAction(type: string, diagram: Diagram | string, payload?: {}): any {
    payload = payload || {};

    if (diagram instanceof Diagram) {
        payload['diagramId'] = diagram.id;
    } else {
        payload['diagramId'] = diagram;
    }

    return { type: type, payload: payload };
}