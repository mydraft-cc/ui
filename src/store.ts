/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Middleware, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { assets, buildAlignment, buildAppearance, buildDiagrams, buildGrouping, buildItems, buildOrdering, createClassReducer, loading, loadingMiddleware, mergeAction, rootLoading, selectDiagram, selectItems, theme, toastMiddleware, ui, undoable } from './wireframes/model/actions';
import { EditorState } from './wireframes/model/editor-state';
import { createInitialAssetsState, createInitialLoadingState, createInitialUIState } from './wireframes/model/internal';
import { registerRenderers } from './wireframes/shapes';

registerRenderers();

const editorState = EditorState.create();

const editorReducer = createClassReducer(editorState, builder => {
    buildAlignment(builder);
    buildAppearance(builder);
    buildDiagrams(builder);
    buildGrouping(builder);
    buildItems(builder);
    buildOrdering(builder);
});

const undoableReducer = undoable(
    editorReducer,
    editorState, {
        actionMerger: mergeAction,
        actionsToIgnore: [
            selectDiagram.name,
            selectItems.name,
        ],
    });

// Define AppState and AppDispatch before configureStore
const rootReducer = {
    // Contains the store for the left sidebar.
    assets: assets(createInitialAssetsState()),
    // Actual editor content.
    editor: rootLoading(undoableReducer, editorReducer),
    // Loading state, e.g. when something has been loaded.
    loading: loading(createInitialLoadingState()),
    // Theme settings for light/dark mode
    theme,
    // General UI behavior.
    ui: ui(createInitialUIState()),
};

// Define temporary store to infer AppState type
const tempStore = configureStore({ reducer: rootReducer, middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }) });
export type AppState = ReturnType<typeof tempStore.getState>;
export type AppDispatch = typeof tempStore.dispatch;

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }).concat(
        toastMiddleware() as Middleware<{}, AppState, AppDispatch>,
        loadingMiddleware() as Middleware<{}, AppState, AppDispatch>
    ),
});

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;