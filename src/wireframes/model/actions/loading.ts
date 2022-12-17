/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { createAction, createAsyncThunk, createReducer, Middleware } from '@reduxjs/toolkit';
import { push } from 'connected-react-router';
import { saveAs } from 'file-saver';
import { AnyAction, Reducer } from 'redux';
import { texts } from '@app/texts';
import { EditorState, EditorStateInStore, LoadingState, LoadingStateInStore, saveRecentDiagrams, UndoableState } from './../internal';
import { getDiagram, postDiagram, putDiagram } from './api';
import { addDiagram } from './diagrams';
import { selectItems } from './items';
import { migrateOldAction } from './obsolete';
import { showErrorToast, showInfoToast } from './ui';

export const newDiagram =
    createAction<{ navigate: boolean }>('diagram/new');

export const loadDiagramFromActions =
    createAction<{ actions: AnyAction[] }>('diagram/load/actions');

export const loadDiagram =
    createAsyncThunk('diagram/load', async (args: { tokenToRead: string; tokenToWrite?: string; navigate: boolean }, thunkAPI) => {
        const state = thunkAPI.getState() as LoadingStateInStore;

        if (!args.tokenToRead || args.tokenToRead === state.loading.tokenToRead) {
            return null;
        }

        const actions = await getDiagram(args.tokenToRead);

        return { tokenToRead: args.tokenToRead, tokenToWrite: args.tokenToWrite, actions };
    });

export const saveDiagramToFile = 
    createAsyncThunk('diagram/save/file', async (_, thunkAPI) => {
        const state = thunkAPI.getState() as LoadingStateInStore & EditorStateInStore;

        const bodyText = JSON.stringify(state.editor.actions, undefined, 2);
        const bodyBlob = new Blob([bodyText], { type: 'application/json' });

        saveAs(bodyBlob, 'diagram.json');
    });

export const saveDiagramToServer =
    createAsyncThunk('diagram/save/server', async (args: { navigate?: boolean }, thunkAPI) => {
        const state = thunkAPI.getState() as LoadingStateInStore & EditorStateInStore;

        const tokenToWrite = state.loading.tokenToWrite;
        const tokenToRead = state.loading.tokenToRead;

        if (tokenToRead && tokenToWrite) {
            await putDiagram(tokenToRead, tokenToWrite, state.editor.actions.filter(x => !selectItems.match(x)));

            return { tokenToRead, tokenToWrite, update: true, navigate: args.navigate };
        } else {
            const { readToken, writeToken } = await postDiagram(state.editor.actions);

            return { tokenToRead: readToken, tokenToWrite: writeToken, navigate: args.navigate };
        }
    });

export function loadingMiddleware(): Middleware {
    const middleware: Middleware = store => next => action => {
        const result = next(action);

        if (newDiagram.match(action)) {
            if (action.payload?.navigate) {
                store.dispatch(push(''));
            }
        } else if (loadDiagram.fulfilled.match(action)) {
            if (action.meta.arg.navigate && action.payload) {
                store.dispatch(push(action.payload.tokenToRead));
            }
            
            if (action.payload) {
                store.dispatch(loadDiagramFromActions({ actions: action.payload!.actions }));
            }
        } else if (loadDiagramFromActions.match(action)) {
            store.dispatch(showInfoToast(texts.common.loadingDiagramDone));
        } else if (loadDiagram.rejected.match(action)) {
            store.dispatch(showErrorToast(texts.common.loadingDiagramFailed));
        } else if (saveDiagramToFile.fulfilled.match(action)) {
            store.dispatch(showInfoToast(texts.common.savingDiagramDone));
        } else if (saveDiagramToServer.fulfilled.match(action)) {
            if (action.meta.arg.navigate) {
                store.dispatch(push(action.payload.tokenToRead));
            }

            saveRecentDiagrams((store.getState() as LoadingStateInStore).loading.recentDiagrams);

            if (!action.payload.update) {
                const fullUrl = `${window.location.protocol}//${window.location.host}/${action.payload.tokenToRead}`;

                store.dispatch(showInfoToast(texts.common.savingDiagramDoneUrl(fullUrl)));
            } else {
                store.dispatch(showInfoToast(texts.common.savingDiagramDone));
            }
        } else if (saveDiagramToServer.rejected.match(action)) {
            store.dispatch(showErrorToast(texts.common.savingDiagramFailed));
        }

        return result;
    };

    return middleware;
}

export function loading(initialState: LoadingState) {
    return createReducer(initialState, builder => builder
        .addCase(newDiagram, (state) => {
            state.isLoading = false;
            state.tokenToRead = null;
            state.tokenToWrite = null;
        })
        .addCase(loadDiagram.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(loadDiagram.rejected, (state) => {
            state.isLoading = false;
        })
        .addCase(loadDiagram.fulfilled, (state, action) => {
            state.isLoading = false;
            state.tokenToRead = action.payload?.tokenToRead;
            state.tokenToWrite = action.payload?.tokenToWrite;
        })
        .addCase(saveDiagramToServer.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(saveDiagramToServer.rejected, (state) => {
            state.isLoading = false;
        })
        .addCase(saveDiagramToServer.fulfilled, (state, action) => {
            const { tokenToRead, tokenToWrite } = action.payload;

            state.isLoading = false;
            state.tokenToRead = tokenToRead;
            state.tokenToWrite = tokenToWrite;
            state.recentDiagrams[tokenToRead] = { date: new Date().getTime(), tokenToWrite };
        }));
}

export function rootLoading(innerReducer: Reducer<any>, undoableReducer: Reducer<UndoableState<EditorState>>, editorReducer: Reducer<EditorState>): Reducer<any> {
    return (state: any, action: any) => {
        if (newDiagram.match(action)) {
            const initialAction = addDiagram();
            const initialState = editorReducer(EditorState.empty(), initialAction);

            state = UndoableState.create(initialState, initialAction);
        } else if (loadDiagramFromActions.match(action)) {
            const actions = action.payload.actions;

            let firstAction = actions[0];

            if (!firstAction) {
                firstAction = addDiagram();
            }

            let editor = UndoableState.create(editorReducer(EditorState.empty(), firstAction), firstAction);

            for (const loadedAction of actions.slice(1)) {
                editor = undoableReducer(editor, migrateOldAction(loadedAction));
            }

            const diagram = editor.present.diagrams.get(editor.present.selectedDiagramId!);

            if (diagram) {
                state = undoableReducer(editor, selectItems(diagram, []));
            } else {
                const initialAction = addDiagram();
                const initialState = editorReducer(EditorState.empty(), initialAction);

                state = UndoableState.create(initialState, initialAction);
            }
        }

        return innerReducer(state, action);
    };
}
