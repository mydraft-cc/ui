import { Action, Middleware, Reducer } from 'redux';

import { MathHelper, Vec2 } from '@app/core';

import {
    Diagram,
    DiagramItem,
    DiagramItemSet,
    EditorState,
    RendererService,
    Serializer
} from './../internal';

import {
    createDiagramAction,
    createItemsAction,
    DiagramRef,
    ItemsRef
} from './utils';

// tslint:disable:no-shadowed-variable

export const ADD_VISUAL = 'ADD_VISUAL';
export const addVisual = (diagram: DiagramRef, renderer: string, x: number, y: number, properties?: object, shapeId?: string) => {
    return createDiagramAction(ADD_VISUAL, diagram, { shapeId: shapeId || MathHelper.guid(), renderer, position: { x, y }, properties });
};

export const ADD_IMAGE = 'ADD_IMAGE';
export const addImage = (diagram: DiagramRef, source: string, x: number, y: number, w: number, h: number, shapeId?: string) => {
    return createDiagramAction(ADD_IMAGE, diagram, { shapeId: shapeId || MathHelper.guid(), source, position: { x, y }, size: { w, h } });
};

export const ADD_ICON = 'ADD_ICON';
export const addIcon = (diagram: DiagramRef, text: string, fontFamily: string, x: number, y: number, shapeId?: string) => {
    return createDiagramAction(ADD_ICON, diagram, { shapeId: shapeId || MathHelper.guid(), text, fontFamily, position: { x, y } });
};

export const LOCK_ITEMS = 'LOCK_ITEMS';
export const lockItems = (diagram: DiagramRef, items: ItemsRef) => {
    return createItemsAction(LOCK_ITEMS, diagram, items);
};

export const UNLOCK_ITEMS = 'UNLOCK_ITEMS';
export const unlockItems = (diagram: DiagramRef, items: ItemsRef) => {
    return createItemsAction(UNLOCK_ITEMS, diagram, items);
};

export const SELECT_ITEMS = 'SELECT_ITEMS';
export const selectItems = (diagram: DiagramRef, items: ItemsRef) => {
    return createItemsAction(SELECT_ITEMS, diagram, items);
};

export const REMOVE_ITEMS = 'REMOVE_ITEMS';
export const removeItems = (diagram: DiagramRef, items: ItemsRef) => {
    return createItemsAction(REMOVE_ITEMS, diagram, items);
};

export const PASTE_ITEMS = 'PASTE_ITEMS';
export const pasteItems = (diagram: DiagramRef, json: string, offset = 0) => {
    return createDiagramAction(PASTE_ITEMS, diagram, { json, offset });
};

const MAX_IMAGE_SIZE = 300;

export function itemsMiddleware(serializer: Serializer): Middleware {
    const middleware: Middleware = store => next => (action: Action & any) => {
        if (action.type === PASTE_ITEMS) {
            action.json = serializer.generateNewIds(action.json);
        }

        return next(action);
    };

    return middleware;
}

export function items(rendererService: RendererService, serializer: Serializer): Reducer<EditorState> {
    const reducer: Reducer<EditorState> = (state: EditorState, action: any) => {
        switch (action.type) {
            case SELECT_ITEMS:
                return state.updateDiagram(action.diagramId, diagram => {
                    return diagram.selectItems(action.itemIds);
                });
            case REMOVE_ITEMS:
                return state.updateDiagram(action.diagramId, diagram => {
                    const set = DiagramItemSet.createFromDiagram(action.itemIds, diagram);

                    return diagram.removeItems(set!);
                });
            case LOCK_ITEMS:
                return state.updateDiagram(action.diagramId, diagram => {
                    const set = DiagramItemSet.createFromDiagram(action.itemIds, diagram);

                    for (let item of set!.allItems) {
                        diagram = diagram.updateItem(item.id, i => i.lock());
                    }

                    return diagram;
                });
            case UNLOCK_ITEMS:
                return state.updateDiagram(action.diagramId, diagram => {
                    const set = DiagramItemSet.createFromDiagram(action.itemIds, diagram);

                    for (let item of set!.allItems) {
                        diagram = diagram.updateItem(item.id, i => i.unlock());
                    }

                    return diagram;
                });
            case PASTE_ITEMS:
                return state.updateDiagram(action.diagramId, diagram => {
                    const set = serializer.deserializeSet(action.json);

                    diagram = diagram.addItems(set);

                    for (let item of set.allVisuals) {
                        diagram = diagram.updateItem(item.id, i => {
                            const oldBounds = i.bounds(diagram);
                            const newBounds = oldBounds.moveBy(new Vec2(action.offset, action.offset));

                            return i.transformByBounds(oldBounds, newBounds);
                        });
                    }

                    diagram = diagram.selectItems(set.rootIds);

                    return diagram;
                });
            case ADD_ICON:
                return state.updateDiagram(action.diagramId, diagram => {
                    const renderer = rendererService.registeredRenderers['Icon'];

                    const shape = renderer.createDefaultShape(action.shapeId);

                    const position =
                        new Vec2(
                            action.position.x + shape.transform.size.x * 0.5,
                            action.position.y + shape.transform.size.y * 0.5);

                    const configured =
                        shape.transformWith(t => t.moveTo(position))
                            .setAppearance(DiagramItem.APPEARANCE_TEXT, action.text)
                            .setAppearance(DiagramItem.APPEARANCE_ICON_FONT_FAMILY, action.fontFamily);

                    return diagram.addVisual(configured).selectItems([configured.id]);
                });
            case ADD_IMAGE:
                return state.updateDiagram(action.diagramId, diagram => {
                    let size =
                        new Vec2(
                            action.size.w,
                            action.size.h);

                    if (size.x > MAX_IMAGE_SIZE || size.y > MAX_IMAGE_SIZE) {
                        const ratio = size.x / size.y;

                        if (ratio > 1) {
                            size = new Vec2(MAX_IMAGE_SIZE, MAX_IMAGE_SIZE / ratio);
                        } else {
                            size = new Vec2(MAX_IMAGE_SIZE * ratio, MAX_IMAGE_SIZE);
                        }
                    }

                    const position =
                        new Vec2(
                            action.position.x + size.x * 0.5,
                            action.position.y + size.y * 0.5);

                    const renderer = rendererService.registeredRenderers['Raster'];

                    const shape =
                        renderer.createDefaultShape(action.shapeId)
                            .transformWith(t => t.resizeTo(size))
                            .transformWith(t => t.moveTo(position))
                            .setAppearance('SOURCE', action.source);

                    return diagram.addVisual(shape).selectItems([shape.id]);
                });
            case ADD_VISUAL:
                return state.updateDiagram(action.diagramId, diagram => {
                    const renderer = rendererService.registeredRenderers[action.renderer];

                    const shape = renderer.createDefaultShape(action.shapeId);

                    const position =
                        new Vec2(
                            action.position.x + shape.transform.size.x * 0.5,
                            action.position.y + shape.transform.size.y * 0.5);

                    let configured = shape.transformWith(t => t.moveTo(position));

                    let properties = action.properties;
                    if (properties) {
                        for (let key in properties) {
                            if (properties.hasOwnProperty(key)) {
                                configured = configured.setAppearance(key, properties[key]);
                            }
                        }
                    }

                    return diagram.addVisual(configured).selectItems([configured.id]);
                });
            default:
                return state;
        }
    };

    return reducer;
}

export function calculateSelection(items: DiagramItem[], diagram: Diagram, isSingleSelection?: boolean, isCtrl?: boolean): string[] {
    if (!items) {
        return [];
    }

    let selectedItems: DiagramItem[] = [];

    function resolveGroup(item: DiagramItem, stop?: DiagramItem) {
        while (true) {
            const group = diagram.parent(item.id);

            if (!group || group === stop) {
                break;
            } else {
                item = group;
            }
        }

        return item;
    }

    if (isSingleSelection) {
        if (items.length === 1) {
            const single = items[0];

            if (single) {
                const singleId = single.id;

                if (isCtrl) {
                    if (!single.isLocked) {
                        if (diagram.selectedIds.has(singleId)) {
                            return diagram.selectedIds.remove(singleId).values;
                        } else {
                            return diagram.selectedIds.add(resolveGroup(single).id).values;
                        }
                    } else {
                        return diagram.selectedIds.values;
                    }
                } else {
                    const group = diagram.parent(single.id);

                    if (group && diagram.selectedIds.has(group.id)) {
                        selectedItems.push(resolveGroup(single, group));
                    } else {
                        selectedItems.push(resolveGroup(single));
                    }
                }
            }
        }
    } else {
        const selection: { [id: string]: DiagramItem } = {};

        for (let item of items) {
            if (item) {
                item = resolveGroup(item);

                if (!selection[item.id]) {
                    selection[item.id] = item;
                    selectedItems.push(item);
                }
            }
        }
    }

    if (selectedItems.length > 1) {
        selectedItems = selectedItems.filter(i => !i.isLocked);
    }

    return selectedItems.map(i => i.id);
}