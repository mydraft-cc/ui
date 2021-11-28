/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { createAction, createReducer } from '@reduxjs/toolkit';
import { AssetsState } from './../internal';

export const filterShapes =
    createAction<{ filter: string }>('shapes/filter');

export const filterIcons =
    createAction<{ filter: string }>('icons/filter');

export const selectIcons =
    createAction<{ iconSet: string }>('icons/select');

export function assets(initialState: AssetsState) {
    return createReducer(initialState, builder => builder
        .addCase(filterShapes, (state, action) => {
            state.shapesFilter = action.payload.filter;
        })
        .addCase(filterIcons, (state, action) => {
            state.iconsFilter = action.payload.filter;
        })
        .addCase(selectIcons, (state, action) => {
            state.iconSet = action.payload.iconSet;
        }));
}
