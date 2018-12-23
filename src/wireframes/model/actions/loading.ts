import { push } from 'react-router-redux';
import { Dispatch, Reducer } from 'redux';

let url = 'https://api.mydraft.cc';

if (process.env.NODE_ENV === 'test_development') {
    url = 'http://localhost:4000';
}

import {
    EditorState,
    EditorStateInStore,
    LoadingState,
    LoadingStateInStore,
    UndoableState
} from './../internal';

import { addDiagram } from './diagrams';
import { selectItems } from './items';
import { showErrorToast, showInfoToast } from './ui';

export const NEW_DIAGRAM = 'NEW_DIAGRAM';
export const newDiagram = (navigate = true) => {
    return (dispatch: Dispatch) => {
        dispatch({ type: NEW_DIAGRAM });

        if (navigate) {
            dispatch(push(''));
        }
    };
};

export const LOADING_STARTED = 'LOADING_STARTED';
export const LOADING_FAILED = 'LOADING_FAILED';
export const LOADING_SUCCEEDED = 'LOADING_SUCCEEDED';
export const loadDiagramAsync = (token: string, navigate = true) => {
    return (dispatch: Dispatch, getState: () => LoadingStateInStore) => {
        const state = getState();

        if (token && token.length > 0 && token !== state.loading.readToken) {
            dispatch({ type: LOADING_STARTED });

            fetch(`${url}/${token}`)
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw Error('Failed to load diagram');
                    }
                })
                .then(response => {
                    dispatch({ type: LOADING_SUCCEEDED, readToken: token, actions: response });

                    dispatch(showInfoToast('Succeeded to load diagram.'));

                    if (navigate) {
                        dispatch(push(token));
                    }
                }, (error: Error) => {
                    dispatch({ type: LOADING_FAILED });
                    dispatch(showErrorToast(error.message));
                });
        }
    };
};

export const SAVING_STARTED = 'SAVING_STARTED';
export const SAVING_FAILED = 'SAVING_FAILED';
export const SAVING_SUCCEEDED = 'SAVING_SUCCEEDED';
export const saveDiagramAsync = (navigate = true) => {
    return (dispatch: Dispatch, getState: () => LoadingStateInStore & EditorStateInStore) => {
        const state = getState();

        const writeToken = state.loading.writeToken;
        const readToken = state.loading.readToken;

        const body = JSON.stringify(state.editor.actions);

        let putPromise: Promise<{ readToken: string, writeToken: string }>;

        if (readToken && writeToken) {
            putPromise = fetch(`${url}/${readToken}/${writeToken}`, {
                method: 'PUT',
                headers: {
                    ContentType: 'text/json'
                },
                body
            }).then(() => ({ readToken, writeToken }));
        } else {
            putPromise = Promise.reject({});
        }

        putPromise.catch(() =>
            fetch(`${url}/`, {
                method: 'POST',
                headers: {
                    ContentType: 'text/json'
                },
                body
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw Error('Failed to save diagram');
                }
            }))
        .then(r => {
            dispatch({ type: SAVING_SUCCEEDED, writeToken: r.writeToken, readToken: r.readToken });

            if (r.writeToken !== state.loading.writeToken) {
                const fullUrl = `${window.location.protocol}//${window.location.host}/${r.readToken}`;

                dispatch(showInfoToast(`Diagram saved under ${fullUrl}.`));
            } else {
                dispatch(showInfoToast(`Diagram saved and updated.`));
            }

            if (navigate) {
                dispatch(push(r.readToken));
            }
        }, (err: Error) => {
            dispatch({ type: SAVING_FAILED });
            dispatch(showErrorToast(err.message));
        });
    };
};

export function loading(initialState: LoadingState): Reducer<LoadingState> {
    const reducer: Reducer<LoadingState> = (state = initialState, action: any) => {
        switch (action.type) {
            case NEW_DIAGRAM:
                return { isSaving: false, isLoading: true };
            case LOADING_STARTED:
                return { isSaving: false, isLoading: true };
            case LOADING_FAILED:
                return { isSaving: false, isLoading: false };
            case LOADING_SUCCEEDED:
                return { isSaving: false, isLoading: false, readToken: action.readToken, writeToken: null };
            case SAVING_STARTED:
                return { isLoading: false, isSaving: true };
            case SAVING_FAILED:
                return { isLoading: false, isSaving: false };
            case SAVING_SUCCEEDED:
                return { isLoading: false, isSaving: false, readToken: action.readToken, writeToken: action.writeToken };
            default:
                return state;
        }
    };

    return reducer;
}

export function rootLoading(innerReducer: Reducer<any>, undoableReducer: Reducer<UndoableState<EditorState>>, editorReducer: Reducer<EditorState>): Reducer<any> {
    const reducer: Reducer<EditorStateInStore> = (state: EditorStateInStore, action: any) => {
        switch (action.type) {
            case NEW_DIAGRAM: {
                const initialAction = addDiagram();
                const initialState = editorReducer(EditorState.empty(), initialAction);

                state = { editor: UndoableState.create(initialState, initialAction) };
                break;
            }
            case LOADING_SUCCEEDED: {
                let firstAction = action.actions[0];

                if (!firstAction) {
                    firstAction = addDiagram();
                }

                let editor = UndoableState.create(editorReducer(EditorState.empty(), firstAction), firstAction);

                for (let loadedAction of action.actions) {
                    editor = undoableReducer(editor, loadedAction);
                }

                let present = editor.present;

                const diagram = present.diagrams.get(present.selectedDiagramId!);

                if (diagram) {
                    state = { editor: undoableReducer(editor, selectItems(diagram, [])) };
                } else {
                    const initialAction = addDiagram();
                    const initialState = editorReducer(EditorState.empty(), initialAction);

                    state = { editor: UndoableState.create(initialState, initialAction) };
                }
                break;
            }
        }

        return innerReducer(state, action);
    };

    return reducer;
}