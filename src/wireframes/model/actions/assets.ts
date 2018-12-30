import { Reducer } from 'redux';
import { createSelector } from 'reselect';

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

export const getIconsFilter = (state: { assets: AssetsState }) => state.assets.iconsFilter;
export const getIconSet = (state: { assets: AssetsState }) => state.assets.iconSet;
export const getIcons = (state: { assets: AssetsState }) => state.assets.icons;
export const getShapesFilter = (state: { assets: AssetsState }) => state.assets.shapesFilter;
export const getShapes = (state: { assets: AssetsState }) => state.assets.shapes;

export const getIconSets = createSelector(
    getIcons,
    icons => Object.keys(icons)
);

export const getSelectedIcons = createSelector(
    getIcons,
    getIconSet,
    (icons, set) => icons[set]
);

export const getFilteredIcons = createSelector(
    getSelectedIcons,
    getIconsFilter,
    (icons, filter) => filter && filter.length > 0 ? icons.filter(x => x.searchTerm.indexOf(filter) >= 0) : icons
);

export const getFilteredShapes = createSelector(
    getShapes,
    getShapesFilter,
    (shapes, filter) => filter && filter.length > 0 ? shapes.filter(x => x.searchTerm.indexOf(filter) >= 0) : shapes
);

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