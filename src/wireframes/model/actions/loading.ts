/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { createAction, createAsyncThunk, createReducer, Middleware } from '@reduxjs/toolkit';
import { push } from 'react-router-redux';
import { Reducer } from 'redux';
import { EditorState, EditorStateInStore, LoadingState, LoadingStateInStore, UndoableState } from './../internal';
import { addDiagram } from './diagrams';
import { selectItems } from './items';
import { showErrorToast, showInfoToast } from './ui';

let url = 'https://api.mydraft.cc';

if (process.env.NODE_ENV === 'test_development') {
    url = 'http://localhost:4000';
}

export const newDiagram =
    createAction<{ navigate: boolean }>('diagram/new');

export const loadDiagramAsync =
    createAsyncThunk('diagram/load', async (args: { token: string; navigate: boolean }, thunkAPI) => {
        const state = thunkAPI.getState() as LoadingStateInStore;

        if (!args.token || args.token === state.loading.tokenToRead) {
            return null;
        }

        const response = await fetch(`${url}/${args.token}`);

        if (!response.ok) {
            throw Error('Failed to load diagram');
        }

        const actions = await response.json();

        return { tokenToRead: args.token, actions };
    });

export const saveDiagramAsync =
    createAsyncThunk('diagram/save', async (args: { navigate?: boolean }, thunkAPI) => {
        const state = thunkAPI.getState() as LoadingStateInStore & EditorStateInStore;

        const tokenToWrite = state.loading.tokenToWrite;
        const tokenToRead = state.loading.tokenToRead;

        const body = JSON.stringify(state.editor.actions);

        if (tokenToRead && tokenToWrite) {
            const response = await fetch(`${url}/${tokenToRead}/${tokenToWrite}`, {
                method: 'PUT',
                headers: {
                    ContentType: 'text/json',
                },
                body,
            });

            if (!response.ok) {
                throw Error('Failed to save diagram');
            }

            return { tokenToRead, tokenToWrite, update: true, navigate: args.navigate };
        } else {
            const response = await fetch(`${url}/`, {
                method: 'POST',
                headers: {
                    ContentType: 'text/json',
                },
                body,
            });

            if (!response.ok) {
                throw Error('Failed to save diagram');
            }

            const json = await response.json();

            return { tokenToRead: json.readToken, tokenToWrite: json.writeToken, navigate: args.navigate };
        }
    });

export function loadingMiddleware(): Middleware {
    const middleware: Middleware = store => next => action => {
        const result = next(action);

        if (newDiagram.match(action)) {
            if (action.payload?.navigate) {
                store.dispatch(push(''));
            }
        } else if (loadDiagramAsync.fulfilled.match(action)) {
            if (action.meta.arg.navigate) {
                store.dispatch(push(action.payload.tokenToRead));
            }

            store.dispatch(showInfoToast('Succeeded to load diagram.'));
        } else if (loadDiagramAsync.rejected.match(action)) {
            store.dispatch(showErrorToast('Failed to load diagram.'));
        } else if (saveDiagramAsync.fulfilled.match(action)) {
            if (action.meta.arg.navigate) {
                store.dispatch(push(action.payload.tokenToRead));
            }

            if (!action.payload.update) {
                const fullUrl = `${window.location.protocol}//${window.location.host}/${action.payload.tokenToRead}`;

                store.dispatch(showInfoToast(`Diagram saved under ${fullUrl}.`));
            } else {
                store.dispatch(showInfoToast('Diagram saved.'));
            }
        } else if (saveDiagramAsync.rejected.match(action)) {
            store.dispatch(showErrorToast('Failed to save diagram.'));
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
        .addCase(loadDiagramAsync.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(loadDiagramAsync.rejected, (state) => {
            state.isLoading = false;
        })
        .addCase(loadDiagramAsync.fulfilled, (state, action) => {
            state.isLoading = false;
            state.tokenToRead = action.payload.tokenToRead;
            state.tokenToWrite = null;
        })
        .addCase(saveDiagramAsync.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(saveDiagramAsync.rejected, (state) => {
            state.isLoading = false;
        })
        .addCase(saveDiagramAsync.fulfilled, (state, action) => {
            state.isLoading = false;
            state.tokenToRead = action.payload.tokenToRead;
            state.tokenToWrite = action.payload.tokenToWrite;
        }));
}

export function rootLoading(innerReducer: Reducer<any>, undoableReducer: Reducer<UndoableState<EditorState>>, editorReducer: Reducer<EditorState>): Reducer<any> {
    return (state: EditorStateInStore, action: any) => {
        if (newDiagram.match(action)) {
            const initialAction = addDiagram();
            const initialState = editorReducer(EditorState.empty(), initialAction);

            state = { editor: UndoableState.create(initialState, initialAction) };
        } else if (loadDiagramAsync.fulfilled.match(action)) {
            const { actions } = action.payload;

            let firstAction = actions[0];

            if (!firstAction) {
                firstAction = addDiagram();
            }

            let editor = UndoableState.create(editorReducer(EditorState.empty(), firstAction), firstAction);

            for (const loadedAction of actions) {
                editor = undoableReducer(editor, loadedAction);
            }

            const present = editor.present;

            const diagram = present.diagrams.get(present.selectedDiagramId!);

            if (diagram) {
                state = { editor: undoableReducer(editor, selectItems(diagram, [])) };
            } else {
                const initialAction = addDiagram();
                const initialState = editorReducer(EditorState.empty(), initialAction);

                state = { editor: UndoableState.create(initialState, initialAction) };
            }
        }

        return innerReducer(state, action);
    };
}
