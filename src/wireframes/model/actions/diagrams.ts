/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper, Vec2 } from '@app/core';
import { ActionReducerMapBuilder, createAction } from '@reduxjs/toolkit';
import { Diagram, EditorState } from './../internal';
import { createDiagramAction, DiagramRef } from './utils';

export const addDiagram =
    createAction('diagram/add', (diagramId?: string) => {
        return { payload: createDiagramAction(diagramId || MathHelper.guid()) };
    });

export const selectDiagram =
    createAction('diagram/select', (diagram: DiagramRef) => {
        return { payload: createDiagramAction(diagram) };
    });

export const removeDiagram =
    createAction('diagram/remove', (diagram: DiagramRef) => {
        return { payload: createDiagramAction(diagram) };
    });

export const changeSize =
    createAction<{ width: number; height: number }>('size/change');

export function buildDiagrams(builder: ActionReducerMapBuilder<EditorState>) {
    return builder
        .addCase(selectDiagram, (state, action) => {
            const { diagramId } = action.payload;

            return state.selectDiagram(diagramId);
        })
        .addCase(addDiagram, (state, action) => {
            const { diagramId } = action.payload;

            return state.addDiagram(Diagram.empty(diagramId)).selectDiagram(diagramId);
        })
        .addCase(removeDiagram, (state, action) => {
            const { diagramId } = action.payload;

            return state.removeDiagram(diagramId);
        })
        .addCase(changeSize, (state, action) => {
            const { width, height } = action.payload;

            return state.changeSize(new Vec2(width, height));
        });
}
