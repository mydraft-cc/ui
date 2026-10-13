/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Middleware, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { combineReducers, Reducer } from 'redux';
import { binder } from './wireframes/collaboration/binder';
import { assets, buildAlignment, buildAppearance, buildDiagrams, buildGrouping, buildItems, buildOrdering, createClassReducer, loading, loadingMiddleware, rootLoading, toastMiddleware, ui } from './wireframes/model/actions';
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

// Define AppState and AppDispatch before configureStore
const rootReducer = {
    // Contains the store for the left sidebar.
    assets: assets(createInitialAssetsState()),
    // Actual editor content.
    editor: rootLoading(editorReducer),
    // Loading state, e.g. when something has been loaded.
    loading: loading(createInitialLoadingState()),
    // General UI behavior.
    ui: ui(createInitialUIState()),
};

// The editor slice is synchronized with yjs for real-time collaboration and undo.
const reducer = binder.enhanceReducer(combineReducers(rootReducer)) as Reducer<ReturnType<ReturnType<typeof combineReducers<typeof rootReducer>>>>;

export const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false, immutableCheck: false }).concat(
        toastMiddleware() as Middleware,
        loadingMiddleware() as Middleware,
        binder.middleware as Middleware,
    ),
});

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

