/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { createAction, createReducer } from '@reduxjs/toolkit';
import { message } from 'antd';
import { AnyAction, Dispatch, Middleware, Reducer } from 'redux';
import { UIState } from './../internal';

export const showInfoToast =
    createAction<string>('ui/infoToast');

export const showErrorToast =
    createAction<string>('ui/errorToast');

export const setZoom =
    createAction<number>('ui/zoom');

export const selectColorTab =
    createAction<string>('ui/colorTab');

export const selectTab =
    createAction<string>('ui/tab');

export const toggleLeftSidebar =
    createAction('ui/toggleLeftSidebar');

export const toggleRightSidebar =
    createAction('ui/toggleRightSidebar');

export const filterDiagrams =
    createAction<{ filter: string }>('ui/diagrams/filter');

export function toastMiddleware() {
    const middleware: Middleware = () => (next: Dispatch<AnyAction>) => (action: any) => {
        if (showInfoToast.match(action)) {
            message.info(action.payload);
        } else if (showErrorToast.match(action)) {
            message.error(action.payload);
        }

        return next(action);
    };

    return middleware;
}

export function ui(initialState: UIState): Reducer<UIState> {
    return createReducer(initialState, builder => builder
        .addCase(filterDiagrams, (state, action) => {
            state.diagramsFilter = action.payload.filter;
        })
        .addCase(setZoom, (state, action) => {
            state.zoom = action.payload;
        })
        .addCase(selectTab, (state, action) => {
            state.selectedTab = action.payload;
        })
        .addCase(selectColorTab, (state, action) => {
            state.selectedColorTab = action.payload;
        })
        .addCase(toggleLeftSidebar, (state) => {
            state.showLeftSidebar = !state.showLeftSidebar;
        })
        .addCase(toggleRightSidebar, (state) => {
            state.showRightSidebar = !state.showRightSidebar;
        }));
}
