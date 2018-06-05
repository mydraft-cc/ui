import { Reducer } from 'redux';

import {
    addDiagram,
    EditorLoadingState,
    EditorState,
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

export function editorLoading(initialState: EditorLoadingState): Reducer<EditorLoadingState> {
    const reducer: Reducer<EditorLoadingState> = (state = initialState, action: any) => {
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

interface EditorPath {
    editor: UndoableState<EditorState>;
}

export function rootLoading(innerReducer: Reducer<any>, editorReducer: Reducer<EditorState>): Reducer<any> {
    const reducer: Reducer<EditorPath> = (state: EditorPath, action: any) => {
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