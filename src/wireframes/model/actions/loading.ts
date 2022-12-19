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
import { showToast } from './ui';

export const newDiagram =
    createAction<{ navigate: boolean }>('diagram/new');

export const loadDiagramFromFile =
    createAsyncThunk('diagram/load/file', async (args: { file: File }) => {
        const actions: AnyAction[] = JSON.parse(await args.file.text());

        return { actions };
    });

export const loadDiagramFromServer =
    createAsyncThunk('diagram/load/server', async (args: { tokenToRead: string; tokenToWrite?: string; navigate: boolean }) => {
        const actions = await getDiagram(args.tokenToRead);

        return { tokenToRead: args.tokenToRead, tokenToWrite: args.tokenToWrite, actions };
    });

const loadDiagramInternal =
    createAction<{ actions: AnyAction[]; requestId: string }>('diagram/load/actions');

export const saveDiagramToFile = 
    createAsyncThunk('diagram/save/file', async (_, thunkAPI) => {
        const state = thunkAPI.getState() as LoadingStateInStore & EditorStateInStore;

        const bodyText = JSON.stringify(state.editor.actions);
        const bodyBlob = new Blob([bodyText], { type: 'application/json' });

        saveAs(bodyBlob, 'diagram.json');
    });

export const saveDiagramToServer =
    createAsyncThunk('diagram/save/server', async (args: { navigate?: boolean; operationId?: string }, thunkAPI) => {
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
        if (loadDiagramFromServer.pending.match(action) ||  loadDiagramFromFile.pending.match(action)) {
            store.dispatch(showToast({ content: texts.common.loadingDiagram, type: 'loading', key: action.meta.requestId }));
        } else if ( saveDiagramToServer.pending.match(action) || saveDiagramToFile.pending.match(action)) {
            store.dispatch(showToast({ content: texts.common.savingDiagram, type: 'loading', key: action.meta.requestId }));
        }

        try {
            const result = next(action);

            if (newDiagram.match(action) ) {
                if (action.payload.navigate) {
                    store.dispatch(push(''));
                }
            } else if (loadDiagramFromServer.fulfilled.match(action)) {
                if (action.meta.arg.navigate) {
                    store.dispatch(push(action.payload.tokenToRead));
                }
                
                store.dispatch(loadDiagramInternal({ actions: action.payload!.actions, requestId: action.meta.requestId }));
            } else if (loadDiagramFromFile.fulfilled.match(action)) {
                store.dispatch(loadDiagramInternal({ actions: action.payload!.actions, requestId: action.meta.requestId }));
            } else if (loadDiagramFromServer.rejected.match(action) ||  loadDiagramFromFile.rejected.match(action)) {
                store.dispatch(showToast({ content: texts.common.loadingDiagramFailed, type: 'error', key: action.meta.requestId, delayed: 1000 }));
            } else if (loadDiagramInternal.match(action)) {
                store.dispatch(showToast({ content: texts.common.loadingDiagramDone, type: 'success', key: action.payload.requestId, delayed: 1000 }));
            } else if (saveDiagramToServer.fulfilled.match(action)) {
                if (action.meta.arg.navigate) {
                    store.dispatch(push(action.payload.tokenToRead));
                }

                saveRecentDiagrams((store.getState() as LoadingStateInStore).loading.recentDiagrams);

                const content = action.payload.update ? 
                    texts.common.savingDiagramDone :
                    texts.common.savingDiagramDoneUrl(`${window.location.protocol}//${window.location.host}/${action.payload.tokenToRead}`);

                store.dispatch(showToast({ content, type: 'success', key: action.meta.requestId, delayed: 1000 }));
            } else if (saveDiagramToFile.fulfilled.match(action)) {
                store.dispatch(showToast({ content: texts.common.savingDiagramDone, type: 'success', key: action.meta.requestId, delayed: 1000 }));
            } else if (saveDiagramToServer.rejected.match(action) || saveDiagramToFile.rejected.match(action)) {
                store.dispatch(showToast({ content: texts.common.savingDiagramFailed, type: 'error', key: action.meta.requestId, delayed: 1000 }));
            }

            return result;
        } catch (ex) {
            if (loadDiagramInternal.match(action)) {
                store.dispatch(showToast({ content: texts.common.loadingDiagramFailed, type: 'error', key: action.payload.requestId, delayed: 1000 }));
            }
            
            console.error(ex);
            throw ex;
        }
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
        .addCase(loadDiagramFromServer.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(loadDiagramFromServer.rejected, (state) => {
            state.isLoading = false;
        })
        .addCase(loadDiagramFromServer.fulfilled, (state, action) => {
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
        } else if (loadDiagramInternal.match(action)) {
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
