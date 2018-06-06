import { Action, Dispatch, Reducer } from 'redux';

import {
    addDiagram,
    EditorState,
    EditorStateInStore,
    LoadingState,
    LoadingStateInStore,
    UndoableState
} from '@app/wireframes/model';

export const NEW_DIAGRAM = 'NEW_DIAGRAM';
export const newDiagram = () => {
    return { type: NEW_DIAGRAM };
};

export const LOAD_DIAGRAM = 'LOAD_DIAGRAM';
export const loadDiagram = (token: string) => {
    return { type: LOAD_DIAGRAM, payload: token };
};

export const LOADING_FAILED = 'LOADING_FAILED';
export const loadingFailed = (error: string) => {
    return { type: LOADING_FAILED, payload: error };
};

export const LOADING_SUCCEEDED = 'LOADING_SUCCEEDED';
export const loadingSucceeded = (actions: any[]) => {
    return { type: LOADING_SUCCEEDED, payload: actions };
};

export const HIDE_ERROR = 'HIDE_ERROR';
export const hideError = () => {
    return { type: HIDE_ERROR };
};

export const SAVING_STARTED = 'SAVING_STARTED';
export const SAVING_FAILED = 'SAVING_FAILED';
export const SAVING_SUCCEEDED = 'SAVING_SUCCEEDED';
export const saveDiagramAsync = () => {
    return (dispatch: Dispatch<any>, getState: () => LoadingStateInStore & EditorStateInStore) => {
        const state = getState();

        const body = JSON.stringify(state.editor.actions);

        let putPromise: Promise<{ tokenRead: string, tokenWrite: string }>;

        if (state.loading.tokenRead && state.loading.tokenWrite) {
            const tokenWrite = state.loading.tokenWrite;
            const tokenRead = state.loading.tokenRead;

            putPromise = fetch(`https://api.mydraft.cc/${tokenRead}/${tokenWrite}`, {
                method: 'PUT',
                headers: {
                    ContentType: 'text/json'
                },
                body
            }).then(() => ({ tokenRead, tokenWrite }));
        } else {
            putPromise = Promise.reject({});
        }

        putPromise.catch(() => {
            return fetch(`https://api.mydraft.cc/`, {
                method: 'POST',
                headers: {
                    ContentType: 'text/json'
                },
                body
            }).then(response => response.json());
        })
        .then(r => {
            dispatch({ type: SAVING_SUCCEEDED, tokenWrite: r.tokenWrite, tokenRead: r.tokenRead });
        },
        () => {
            dispatch({ type: SAVING_FAILED, error: 'Failed to save diagram' });
        });
    };
};

export function editorLoading(initialState: LoadingState): Reducer<LoadingState> {
    const reducer: Reducer<LoadingState> = (state = initialState, action: Action & any) => {
        switch (action.type) {
            case LOAD_DIAGRAM:
                return {...state, isLoading: true, tokenRead: action.payload };
            case LOADING_FAILED:
                return {...state, isLoading: false, error: action.payload };
            case LOADING_SUCCEEDED:
                return {...state, isLoading: false, tokenRead: action.payload };
            case HIDE_ERROR:
                return {...state, error: null };
            default:
                return state;
        }
    };

    return reducer;
}

export function rootLoading(innerReducer: Reducer<any>, editorReducer: Reducer<EditorState>): Reducer<any> {
    const reducer: Reducer<EditorStateInStore> = (state: EditorStateInStore, action: any) => {
        switch (action.type) {
            case NEW_DIAGRAM: {
                const initialAction = addDiagram();
                const initialState = editorReducer(EditorState.empty(), initialAction);

                state = { ...state, editor: UndoableState.create(initialState, undefined, initialAction) };
                break;
            }
            case LOADING_SUCCEEDED: {
                let editor = EditorState.empty();

                for (let loadedAction of action.payload) {
                    editor = editorReducer(editor, loadedAction);
                }

                state = { ...state, editor: UndoableState.create(editor) };
                break;
            }
        }

        return innerReducer(state, action);
    };

    return reducer;
}