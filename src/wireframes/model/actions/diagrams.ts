/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ActionReducerMapBuilder, createAction } from '@reduxjs/toolkit';
import { Color, MathHelper, Vec2 } from '@app/core/utils';
import { Diagram, EditorState, DiagramTheme } from './../internal';
import { createDiagramAction, DiagramRef } from './utils';

export const addDiagram =
    createAction('diagram/add', (diagramId?: string) => {
        return { payload: createDiagramAction(diagramId || MathHelper.nextId()) };
    });

export const selectDiagram =
    createAction('diagram/select', (diagram: DiagramRef) => {
        return { payload: createDiagramAction(diagram) };
    });

export const removeDiagram =
    createAction('diagram/remove', (diagram: DiagramRef) => {
        return { payload: createDiagramAction(diagram) };
    });

export const duplicateDiagram =
    createAction('diagram/diagram', (diagram: DiagramRef) => {
        return { payload: createDiagramAction(diagram) };
    });

export const moveDiagram =
    createAction('diagram/move', (diagram: DiagramRef, index: number) => {
        return { payload: createDiagramAction(diagram, { index }) };
    });

export const renameDiagram =
    createAction('diagram/rename', (diagram: DiagramRef, title: string) => {
        return { payload: createDiagramAction(diagram, { title }) };
    });

export const setDiagramMaster =
    createAction('diagram/master', (diagram: DiagramRef, master: string | undefined) => {
        return { payload: createDiagramAction(diagram, { master }) };
    });

export const changeSize =
    createAction('editor/size', (width: number, height: number) => {
        return { payload:  { width, height } };
    });

export const changeDiagramColors =
    createAction('diagram/colors', (oldColor: Color, newColor: Color) => {
        return { payload: { oldColor: oldColor.toString(), newColor: newColor.toString() } };
    });

export const setDiagramBackgroundColor =
    createAction('diagram/background-color', (diagram: DiagramRef, color: Color | null) => {
        return { payload: createDiagramAction(diagram, { color: color?.toString() }) };
    });

export const setDiagramDesignTheme =
    createAction('diagram/design-theme', (diagram: DiagramRef, theme: 'light' | 'dark') => {
        return { payload: createDiagramAction(diagram, { theme }) };
    });

export const updateDiagramThemeSettings =
    createAction('diagram/theme-settings', (diagram: DiagramRef, settings: Partial<DiagramTheme>) => {
        return { payload: createDiagramAction(diagram, { settings }) };
    });

export function buildDiagrams(builder: ActionReducerMapBuilder<EditorState>) {
    return builder
        .addCase(selectDiagram, (state, action) => {
            const { diagramId } = action.payload;

            return state.selectDiagram(diagramId);
        })
        .addCase(renameDiagram, (state, action) => {
            const { diagramId, title } = action.payload;

            return state.updateDiagram(diagramId, diagram => diagram.rename(title));
        })
        .addCase(setDiagramMaster, (state, action) => {
            const { diagramId, master } = action.payload;

            return state.updateDiagram(diagramId, diagram => diagram.setMaster(master));
        })
        .addCase(removeDiagram, (state, action) => {
            const { diagramId } = action.payload;

            return state.removeDiagram(diagramId);
        })
        .addCase(moveDiagram, (state, action) => {
            const { diagramId, index } = action.payload;

            return state.moveDiagram(diagramId, index);
        })
        .addCase(changeSize, (state, action) => {
            const { width, height } = action.payload;

            return state.changeSize(new Vec2(width, height));
        })
        .addCase(changeDiagramColors, (state, action) => {
            const { oldColor, newColor } = action.payload;

            return state.changeColors(Color.fromString(oldColor), Color.fromString(newColor));
        })
        .addCase(duplicateDiagram, (state, action) => {
            const { diagramId } = action.payload;

            const diagram = state.diagrams.get(diagramId);

            if (!diagram) {
                return state;
            }

            return state.addDiagram(diagram.clone());
        })
        .addCase(addDiagram, (state, action) => {
            const { diagramId } = action.payload;

            let newState = state.addDiagram(Diagram.create({ id: diagramId }));

            if (newState.diagrams.size === 1) {
                newState = newState.selectDiagram(diagramId);
            }

            return newState;
        })
        .addCase(setDiagramBackgroundColor, (state, action) => {
            const { diagramId, color } = action.payload;

            return state.updateDiagram(diagramId, diagram => 
                diagram.setBackgroundColor(color ? Color.fromString(color) : null)
            );
        })
        .addCase(setDiagramDesignTheme, (state, action) => {
            const { diagramId, theme } = action.payload;

            return state.updateDiagram(diagramId, diagram => 
                diagram.setDesignTheme(theme)
            );
        })
        .addCase(updateDiagramThemeSettings, (state, action) => {
            const { diagramId, settings } = action.payload;

            return state.updateDiagram(diagramId, diagram => 
                diagram.updateThemeSettings(settings)
            );
        });
}
