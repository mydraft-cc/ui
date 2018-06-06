import { push } from 'react-router-redux';
import { Dispatch, Reducer } from 'redux';

import {
    addDiagram,
    EditorState,
    EditorStateInStore,
    LoadingState,
    LoadingStateInStore,
    selectItems,
    UndoableState
} from '@app/wireframes/model';

import { showErrorToast, showInfoToast } from './ui';

export const NEW_DIAGRAM = 'NEW_DIAGRAM';
export const newDiagram = (navigate = true) => {
    return (dispatch: Dispatch<any>, getState: () => LoadingStateInStore) => {
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
    return (dispatch: Dispatch<any>, getState: () => LoadingStateInStore) => {
        const state = getState();

        if (token && token.length > 0 && token !== state.loading.readToken) {
            dispatch({ type: LOADING_STARTED });

            fetch(`https://api.mydraft.cc/${token}`)
                .then(response => response.json())
                .then(response => {
                    dispatch({ type: LOADING_SUCCEEDED, readToken: token, actions: response });
                    dispatch(showInfoToast('Succeeded to load diagram.'));

                    if (navigate) {
                        dispatch(push(token));
                    }
                }, () => {
                    dispatch({ type: LOADING_FAILED });
                    dispatch(showErrorToast('Failed to save diagram.'));
                });
        }
    };
};

export const SAVING_STARTED = 'SAVING_STARTED';
export const SAVING_FAILED = 'SAVING_FAILED';
export const SAVING_SUCCEEDED = 'SAVING_SUCCEEDED';
export const saveDiagramAsync = (navigate = true) => {
    return (dispatch: Dispatch<any>, getState: () => LoadingStateInStore & EditorStateInStore) => {
        const state = getState();

        const writeToken = state.loading.writeToken;
        const readToken = state.loading.readToken;

        const body = JSON.stringify(state.editor.actions);

        let putPromise: Promise<{ readToken: string, writeToken: string }>;

        if (readToken && writeToken) {
            putPromise = fetch(`https://api.mydraft.cc/${readToken}/${writeToken}`, {
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
            fetch(`https://api.mydraft.cc/`, {
                method: 'POST',
                headers: {
                    ContentType: 'text/json'
                },
                body
            })
            .then(response => response.json()))
        .then(r => {
            dispatch({ type: SAVING_SUCCEEDED, writeToken: r.writeToken, readToken: r.readToken });

            if (r.writeToken !== state.loading.writeToken) {
                const url = `${window.location.protocol}//${window.location.host}/${r.readToken}`;

                dispatch(showInfoToast(`Diagram saved under ${url}.`));
            } else {
                dispatch(showInfoToast(`Diagram saved and updated.`));
            }

            if (navigate) {
                dispatch(push(r.readToken));
            }
        },
        () => {
            dispatch({ type: SAVING_FAILED, error: 'Failed to save diagram' });
            dispatch(showErrorToast('Failed to save diagram.'));
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