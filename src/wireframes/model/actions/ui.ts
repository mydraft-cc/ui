/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { createAction, createReducer } from '@reduxjs/toolkit';
import { message } from 'antd';
import { NoticeType } from 'antd/lib/message/interface';
import { AnyAction, Dispatch, Middleware, Reducer } from 'redux';
import { saveWebGLState, UIState } from './../internal';

export const showToast =
    createAction('ui/infoToast', (content: string, type?: NoticeType, key?: string, delayed = 1000) => {
        return { payload: { content, type, key, delayed } };
    });

export const selectColorTab =
    createAction('ui/colorTab', (tab: string) => {
        return { payload: { tab } };
    });

export const selectTab =
    createAction('ui/tab', (tab: string) => {
        return { payload: { tab } };
    });

export const filterDiagrams =
    createAction('ui/diagrams/filter', (filter: string) => {
        return { payload: { filter } };
    });

export const toggleLeftSidebar =
    createAction('ui/toggleLeftSidebar', () => {
        return { payload: { } };
    });

export const toggleRightSidebar =
    createAction('ui/toggleRightSidebar', () => {
        return { payload: { } };
    });

export const toggleWebGL =
    createAction('ui/webgl', (value: boolean) => {
        return { payload: { value: value } };
    });

export function toastMiddleware() {
    const middleware: Middleware = () => (next: Dispatch<AnyAction>) => (action: any) => {
        if (showToast.match(action)) {
            const { content, delayed, key, type } = action.payload;

            setTimeout(() => {
                message.open({ content, key, type: type || 'info' });
            }, delayed);
        } else if (toggleWebGL.match(action)) {
            saveWebGLState(action.payload.value);
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
        .addCase(selectTab, (state, action) => {
            state.selectedTab = action.payload.tab;
        })
        .addCase(selectColorTab, (state, action) => {
            state.selectedColorTab = action.payload.tab;
        })
        .addCase(toggleLeftSidebar, (state) => {
            state.showLeftSidebar = !state.showLeftSidebar;
        })
        .addCase(toggleRightSidebar, (state) => {
            state.showRightSidebar = !state.showRightSidebar;
        })
        .addCase(toggleWebGL, (state) => {
            state.useWebGL = !state.useWebGL;
        }));
}
