/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/no-loop-func */

import { ActionReducerMapBuilder, createAction, Middleware } from '@reduxjs/toolkit';
import { MathHelper, Vec2 } from '@app/core';
import { Diagram, DiagramItem, DiagramItemSet, EditorState, RendererService, Serializer } from './../internal';
import { createDiagramAction, createItemsAction, DiagramRef, ItemsRef } from './utils';

export const addVisual =
    createAction('items/addVisual', (diagram: DiagramRef, renderer: string, x: number, y: number, appearance?: object, shapeId?: string, width?: number, height?: number) => {
        return { payload: createDiagramAction(diagram, { shapeId: shapeId || MathHelper.nextId(), renderer, position: { x, y }, appearance, width, height }) };
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

export const renameItems =
    createAction('items/rename', (diagram: DiagramRef, items: ItemsRef, name: string) => {
        return { payload: createItemsAction(diagram, items, { name }) };
    });

export const pasteItems =
    createAction('items/paste', (diagram: DiagramRef, json: string, offset = 0) => {
        return { payload: createDiagramAction(diagram, { json, offset }) };
    });

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

                return diagram.updateItems(set.allItems.map(x => x.id), item => {
                    return item.lock();
                });
            });
        })
        .addCase(unlockItems, (state, action) => {
            const { diagramId, itemIds } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                const set = DiagramItemSet.createFromDiagram(itemIds, diagram);

                return diagram.updateItems(set.allItems.map(x => x.id), item => {
                    return item.unlock();
                });
            });
        })
        .addCase(renameItems, (state, action) => {
            const { diagramId, itemIds, name } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                return diagram.updateItems(itemIds, item => {
                    return item.rename(name);
                });
            });
        })
        .addCase(pasteItems, (state, action) => {
            const { diagramId, json, offset } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                const set = serializer.deserializeSet(json);

                diagram = diagram.addItems(set);
                
                diagram = diagram.updateItems(set.allVisuals.map(x => x.id), item => {
                    const boundsOld = item.bounds(diagram);
                    const boundsNew = boundsOld.moveBy(new Vec2(offset, offset));

                    return item.transformByBounds(boundsOld, boundsNew);
                });
                
                diagram = diagram.selectItems(set.rootIds);

                return diagram;
            });
        })
        .addCase(addVisual, (state, action) => {
            const { diagramId, position, appearance, renderer, shapeId, width, height } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                const rendererInstance = rendererService.get(renderer);

                const shape = rendererInstance.createDefaultShape(shapeId);

                let configured = shape.transformWith(transform => {
                    if (width && height) {
                        transform = transform.resizeTo(new Vec2(width, height));
                    }

                    const finalPosition =
                        new Vec2(
                            position.x + transform.size.x * 0.5,
                            position.y + transform.size.y * 0.5);
                            
                    return transform.moveTo(finalPosition);
                });

                if (appearance) {
                    for (const [key, value] of Object.entries(appearance)) {
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
