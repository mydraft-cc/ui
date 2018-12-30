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