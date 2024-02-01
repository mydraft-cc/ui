/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ActionReducerMapBuilder, createAction } from '@reduxjs/toolkit';
import { Color, Types } from '@app/core/utils';
import { EditorState, RendererService, Transform } from './../internal';
import { createItemsAction, DiagramRef, ItemsRef } from './utils';

export const changeColors =
    createAction('items/color', (oldColor: Color, newColor: Color) => {
        return { payload: { oldColor: oldColor.toString(), newColor: newColor.toString() } };
    });

export const changeItemsAppearance =
    createAction('items/appearance', (diagram: DiagramRef, shapes: ItemsRef, key: string, value: any, force = false) => {
        return { payload: createItemsAction(diagram, shapes, { appearance: { key, value }, force }) };
    });

export const transformItems =
    createAction('items/transform', (diagram: DiagramRef, items: ItemsRef, oldBounds: Transform, newBounds: Transform) => {
        return { payload: createItemsAction(diagram, items, { oldBounds: oldBounds.toJS(), newBounds: newBounds.toJS() }) };
    });

export function buildAppearance(builder: ActionReducerMapBuilder<EditorState>) {
    return builder
        .addCase(changeColors, (state, action) => {
            const oldColor = Color.fromValue(action.payload.oldColor);
    
            const newColorValue = Color.fromValue(action.payload.newColor);
            const newColorNumber = newColorValue.toNumber();

            return state.updateAllDiagrams(diagram => {
                return diagram.updateAllItems(item => {
                    if (item.type === 'Group') {
                        return item;
                    }

                    const appearance = item.appearance.mutate(mutator => {
                        for (const [key, value] of item.appearance.entries) {
                            if (key.endsWith('COLOR')) {
                                const parsedColor = Color.fromValue(value);

                                if (parsedColor.eq(oldColor)) {
                                    mutator.set(key, newColorNumber);
                                }
                            }
                        }
                    });

                    return item.replaceAppearance(appearance);
                });
            });
        })
        .addCase(changeItemsAppearance, (state, action) => {
            const { diagramId, appearance, itemIds, force } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                const { key, value } = appearance;

                return diagram.updateItems(itemIds, item => {
                    const rendererInstance = RendererService.get(item.renderer);

                    if (!rendererInstance) {
                        throw new Error(`Cannot find renderer for ${item.renderer}.`);
                    }

                    if (force || !Types.isUndefined(rendererInstance.defaultAppearance()[key])) {
                        return item.setAppearance(key, value);
                    }

                    return item;
                });
            });
        })
        .addCase(transformItems, (state, action) => {
            const { diagramId, itemIds } = action.payload;

            return state.updateDiagram(diagramId, diagram => {
                const boundsOld = Transform.fromJS(action.payload.oldBounds);
                const boundsNew = Transform.fromJS(action.payload.newBounds);

                return diagram.updateItems(itemIds, item => {
                    return item.transformByBounds(boundsOld, boundsNew);
                });
            });
        });
}
