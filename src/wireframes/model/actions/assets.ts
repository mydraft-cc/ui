import { Reducer } from 'redux';

import { AssetsState } from './../internal';

export const FILTER_SHAPES = 'FILTER_SHAPES';
export const filterShapes = (filter: string) => {
    return { type: FILTER_SHAPES, filter };
};

export const FILTER_ICONS = 'FILTER_ICONS';
export const filterIcons = (filter: string) => {
    return { type: FILTER_ICONS, filter };
};

export const SELECT_ICONS = 'SELECT_ICONS';
export const selectIcons = (iconSet: string) => {
    return { type: SELECT_ICONS, iconSet };
};

export function filteredIcons(state: AssetsState) {
    return state.iconsFilter.length === 0 ?
        state.icons[state.iconSet] :
        state.icons[state.iconSet].filter(i => i.searchTerm.indexOf(state.iconsFilter) >= 0);
}

export function filteredShapes(state: AssetsState) {
    return state.shapesFilter.length === 0 ?
        state.shapes :
        state.shapes.filter(i => i.searchTerm.indexOf(state.shapesFilter) >= 0);
}

export function assets(initialState: AssetsState): Reducer<AssetsState> {
    const reducer: Reducer<AssetsState> = (state: AssetsState = initialState, action: any) => {
        switch (action.type) {
            case FILTER_ICONS:
                return { ...state, iconsFilter: action.filter };
            case FILTER_SHAPES:
                return { ...state, shapesFilter: action.filter };
            case SELECT_ICONS:
                return { ...state, iconSet: action.iconSet };
            default:
                return state;
        }
    };

    return reducer;
}