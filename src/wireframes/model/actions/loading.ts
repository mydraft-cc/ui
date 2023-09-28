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
import { Types } from '@app/core';
import { texts } from '@app/texts';
import { user } from '@app/wireframes/user';
import { Diagram, EditorState, EditorStateInStore, LoadingState, LoadingStateInStore, saveRecentDiagrams, Serializer } from './../internal';
import { getDiagram, postDiagram, putDiagram } from './api';
import { selectDiagram } from './diagrams';
import { selectItems } from './items';
import { migrateOldAction } from './obsolete';
import { showToast } from './ui';

export const newDiagram =
    createAction('diagram/new', (navigate: boolean, initialId?: string) => {
        return { payload: { navigate, initialId } };
    });

export const loadDiagramFromFile =
    createAsyncThunk('diagram/load/file', async (args: { file: File }) => {
        const stored = JSON.parse(await args.file.text());

        return { stored };
    });

export const loadDiagramFromServer =
    createAsyncThunk('diagram/load/server', async (args: { tokenToRead: string; tokenToWrite?: string; navigate: boolean }) => {
        const stored = await getDiagram(args.tokenToRead);

        return { tokenToRead: args.tokenToRead, tokenToWrite: args.tokenToWrite, stored };
    });

export const loadDiagramInternal =
    createAction('diagram/load/actions', (stored: any, requestId: string) => {
        return { payload: { stored, requestId } };
    });

export const saveDiagramToFile = 
    createAsyncThunk('diagram/save/file', async (_, thunkAPI) => {
        const state = thunkAPI.getState() as EditorStateInStore;

        const bodyText = JSON.stringify(getSaveState(state), undefined, 4);
        const bodyBlob = new Blob([bodyText], { type: 'application/json' });

        saveAs(bodyBlob, 'diagram.json');
    });

export const saveDiagramToServer =
    createAsyncThunk('diagram/save/server', async (args: { navigate?: boolean; operationId?: string }, thunkAPI) => {
        const state = thunkAPI.getState() as LoadingStateInStore & EditorStateInStore;

        const tokenToWrite = state.loading.tokenToWrite;
        const tokenToRead = state.loading.tokenToRead;

        if (tokenToRead && tokenToWrite) {
            await putDiagram(tokenToRead, tokenToWrite, getSaveState(state));

            return { tokenToRead, tokenToWrite, update: true, navigate: args.navigate };
        } else {
            const { readToken, writeToken } = await postDiagram(getSaveState(state));

            return { tokenToRead: readToken, tokenToWrite: writeToken, navigate: args.navigate };
        }
    });

export function loadingMiddleware(): Middleware {
    const middleware: Middleware = store => next => action => {        
        if (loadDiagramFromServer.pending.match(action) ||  loadDiagramFromFile.pending.match(action)) {
            store.dispatch(showToast(texts.common.loadingDiagram, 'loading', action.meta.requestId));
        } else if ( saveDiagramToServer.pending.match(action) || saveDiagramToFile.pending.match(action)) {
            store.dispatch(showToast(texts.common.savingDiagram, 'loading', action.meta.requestId));
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
                
                store.dispatch(loadDiagramInternal(action.payload.stored, action.meta.requestId));
            } else if (loadDiagramFromFile.fulfilled.match(action)) {
                store.dispatch(loadDiagramInternal(action.payload.stored, action.meta.requestId));
            } else if (loadDiagramFromServer.rejected.match(action) ||  loadDiagramFromFile.rejected.match(action)) {
                store.dispatch(showToast(texts.common.loadingDiagramFailed, 'error', action.meta.requestId));
            } else if (loadDiagramInternal.match(action)) {
                store.dispatch(showToast(texts.common.loadingDiagramDone, 'success', action.payload.requestId));
            } else if (saveDiagramToServer.fulfilled.match(action)) {
                if (action.meta.arg.navigate) {
                    store.dispatch(push(action.payload.tokenToRead));
                }

                saveRecentDiagrams((store.getState() as LoadingStateInStore).loading.recentDiagrams);

                const content = action.payload.update ? 
                    texts.common.savingDiagramDone :
                    texts.common.savingDiagramDoneUrl(`${window.location.protocol}//${window.location.host}/${action.payload.tokenToRead}`);

                store.dispatch(showToast(content, 'success', action.meta.requestId, 1000));
            } else if (saveDiagramToFile.fulfilled.match(action)) {
                store.dispatch(showToast(texts.common.savingDiagramDone, 'success', action.meta.requestId));
            } else if (saveDiagramToServer.rejected.match(action) || saveDiagramToFile.rejected.match(action)) {
                store.dispatch(showToast(texts.common.savingDiagramFailed, 'error', action.meta.requestId));
            }

            return result;
        } catch (ex) {
            if (loadDiagramInternal.match(action)) {
                store.dispatch(showToast(texts.common.loadingDiagramFailed, 'error', action.payload.requestId));
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

export function rootLoading(editorReducer: Reducer<EditorState>, userId: string): Reducer<any> {
    return (state: any, action: any) => {
        if (newDiagram.match(action)) {
            const initialDiagram = Diagram.create();
            const initialState =
                EditorState.create({ id: action.payload.initialId })
                    .addDiagram(initialDiagram).selectDiagram(initialDiagram.id, user.id);

            state = initialState;
        } else if (loadDiagramInternal.match(action)) {
            const stored = action.payload.stored;

            let editor: EditorState;

            if (stored.initial) {
                editor = Serializer.deserializeEditor(stored.initial);
            } else {
                editor = EditorState.create();
            }

            let actions: AnyAction[] = stored.actions || stored ;

            if (Types.isArray(actions) && actions.length > 0) {
                for (const loadedAction of actions.filter(handleAction)) {
                    editor = editorReducer(editor, migrateOldAction(loadedAction));
                }
            }

            if (!editor.diagrams.get(editor.selectedDiagramIds.get(userId)!)) {
                const firstDiagram = editor.orderedDiagrams[0];

                if (firstDiagram) {
                    editor = editor.selectDiagram(firstDiagram.id, userId);
                }
            }

            state = editor;
        }

        return editorReducer(state, action);
    };
}

function getSaveState(state: EditorStateInStore) {
    const initial = Serializer.serializeEditor(state.editor);

    return { initial };
}

function handleAction(action: AnyAction) {
    return !selectItems.match(action) && !selectDiagram.match(action);
}