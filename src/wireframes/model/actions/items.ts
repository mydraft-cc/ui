/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper, Vec2 } from '@app/core';
import { DefaultAppearance } from '@app/wireframes/interface';
import { ActionReducerMapBuilder, createAction, Middleware } from '@reduxjs/toolkit';
import { Diagram, DiagramItem, DiagramItemSet, EditorState, RendererService, Serializer } from './../internal';
import { createDiagramAction, createItemsAction, DiagramRef, ItemsRef } from './utils';

/* eslint-disable @typescript-eslint/no-loop-func */

export const addVisual =
    createAction('items/addVisual', (diagram: DiagramRef, renderer: string, x: number, y: number, properties?: object, shapeId?: string) => {
        return { payload: createDiagramAction(diagram, { shapeId: shapeId || MathHelper.guid(), renderer, position: { x, y }, properties }) };
    });

export const addImage =
    createAction('items/addImage', (diagram: DiagramRef, source: string, x: number, y: number, w: number, h: number, shapeId?: string) => {
        return { payload: createDiagramAction(diagram, { shapeId: shapeId || MathHelper.guid(), source, position: { x, y }, size: { w, h } }) };
    });

export const addIcon =
    createAction('items/addIcon', (diagram: DiagramRef, text: string, fontFamily: string, x: number, y: number, shapeId?: string) => {
        return { payload: createDiagramAction(diagram, { shapeId: shapeId || MathHelper.guid(), text, fontFamily, position: { x, y } }) };
    });

export const lockItems =
    createAction('items/lock', (diagram: DiagramRef, items: ItemsRef) => {
        return { payload: createItemsAction(diagram, items) };
    });

export const unlockItems =
    createAction('items/unlock', (diagram: DiagramRef, items: ItemsRef) => {
        return { payload: createItemsAction(diagram, items) };
    });

export const selectItems =
    createAction('items/select', (diagram: DiagramRef, items: ItemsRef) => {
        return { payload: createItemsAction(diagram, items) };
    });

export const removeItems =
    createAction('items/remove', (diagram: DiagramRef, items: ItemsRef) => {
        return { payload: createItemsAction(diagram, items) };
    });

export const pasteItems =
    createAction('items/paste', (diagram: DiagramRef, json: string, offset = 0) => {
        return { payload: createDiagramAction(diagram, { json, offset }) };
    });

const MAX_IMAGE_SIZE = 300;

export function itemsMiddleware(serializer: Serializer): Middleware {
    const middleware: Middleware = () => next => action => {
        if (pasteItems.match(action)) {
            action.payload.json = serializer.generateNewIds(action.payload.json);
        }

        return next(action);
    };

    return middleware;
}

export function buildItems(builder: ActionReducerMapBuilder<EditorState>, rendererService: RendererService, serializer: Serializer) {
    return builder
        .addCase(selectItems, (state, action) => {
            const { diagramId, itemIds } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                return diagram.selectItems(itemIds);
            });
        })
        .addCase(removeItems, (state, action) => {
            const { diagramId, itemIds } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                const set = DiagramItemSet.createFromDiagram(itemIds, diagram);

                return diagram.removeItems(set!);
            });
        })
        .addCase(lockItems, (state, action) => {
            const { diagramId, itemIds } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                const set = DiagramItemSet.createFromDiagram(itemIds, diagram);

                for (const item of set.allItems) {
                    diagram = diagram.updateItem(item.id, i => i.lock());
                }

                return diagram;
            });
        })
        .addCase(unlockItems, (state, action) => {
            const { diagramId, itemIds } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                const set = DiagramItemSet.createFromDiagram(itemIds, diagram);

                for (const item of set.allItems) {
                    diagram = diagram.updateItem(item.id, i => i.unlock());
                }

                return diagram;
            });
        })
        .addCase(pasteItems, (state, action) => {
            const { diagramId, json, offset } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                const set = serializer.deserializeSet(json);

                diagram = diagram.addItems(set);

                for (const item of set.allVisuals) {
                    diagram = diagram.updateItem(item.id, i => {
                        const oldBounds = i.bounds(diagram);
                        const newBounds = oldBounds.moveBy(new Vec2(offset, offset));

                        return i.transformByBounds(oldBounds, newBounds);
                    });
                }

                diagram = diagram.selectItems(set.rootIds);

                return diagram;
            });
        })
        .addCase(addIcon, (state, action) => {
            const { diagramId, fontFamily, position, shapeId, text } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                const renderer = rendererService.registeredRenderers['Icon'];

                const shape = renderer.createDefaultShape(shapeId);

                const finalPosition =
                    new Vec2(
                        position.x + shape.transform.size.x * 0.5,
                        position.y + shape.transform.size.y * 0.5);

                const configured =
                    shape.transformWith(t => t.moveTo(finalPosition))
                        .setAppearance(DefaultAppearance.TEXT, text)
                        .setAppearance(DefaultAppearance.ICON_FONT_FAMILY, fontFamily);

                return diagram.addVisual(configured).selectItems([configured.id]);
            });
        })
        .addCase(addImage, (state, action) => {
            const { diagramId, position, shapeId, size, source } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                let finalSize = new Vec2(size.w, size.h);

                if (finalSize.x > MAX_IMAGE_SIZE || finalSize.y > MAX_IMAGE_SIZE) {
                    const ratio = finalSize.x / finalSize.y;

                    if (ratio > 1) {
                        finalSize = new Vec2(MAX_IMAGE_SIZE, MAX_IMAGE_SIZE / ratio);
                    } else {
                        finalSize = new Vec2(MAX_IMAGE_SIZE * ratio, MAX_IMAGE_SIZE);
                    }
                }

                const finalPosition =
                    new Vec2(
                        position.x + finalSize.x * 0.5,
                        position.y + finalSize.y * 0.5);

                const renderer = rendererService.registeredRenderers['Raster'];

                const shape =
                    renderer.createDefaultShape(shapeId)
                        .transformWith(t => t.resizeTo(finalSize))
                        .transformWith(t => t.moveTo(finalPosition))
                        .setAppearance('SOURCE', source);

                return diagram.addVisual(shape).selectItems([shape.id]);
            });
        })
        .addCase(addVisual, (state, action) => {
            const { diagramId, position, properties, renderer, shapeId } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                const rendererInstance = rendererService.registeredRenderers[renderer];

                const shape = rendererInstance.createDefaultShape(shapeId);

                const finalPosition =
                    new Vec2(
                        position.x + shape.transform.size.x * 0.5,
                        position.y + shape.transform.size.y * 0.5);

                let configured = shape.transformWith(t => t.moveTo(finalPosition));

                if (properties) {
                    for (const [key, value] of Object.entries(properties)) {
                        configured = configured.setAppearance(key, value);
                    }
                }

                return diagram.addVisual(configured).selectItems([configured.id]);
            });
        });
}

export function calculateSelection(items: DiagramItem[], diagram: Diagram, isSingleSelection?: boolean, isCtrl?: boolean): string[] {
    if (!items) {
        return [];
    }

    let selectedItems: DiagramItem[] = [];

    function resolveGroup(item: DiagramItem, stop?: DiagramItem) {
        // eslint-disable-next-line no-constant-condition
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
