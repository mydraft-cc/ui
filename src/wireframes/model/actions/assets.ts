import { Reducer } from 'redux';

import { AssetsState } from '@app/wireframes/model';

export const FILTER_SHAPES = 'FILTER_SHAPES';
export const filterShapes = (filter: string) => {
    return { type: FILTER_SHAPES, filter };
};

export const FILTER_ICONS = 'FILTER_ICONS';
export const filterIcons = (filter: string) => {
    return { type: FILTER_ICONS, filter };
};

export function assets(initialState: AssetsState): Reducer<AssetsState> {
    const reducer: Reducer<AssetsState> = (state: AssetsState = initialState, action: any) => {
        switch (action.type) {
            case FILTER_ICONS:
                return {
                    ...state,
                    iconsFilter: action.filter,
                    iconsFiltered: action.length === 0 ?
                        state.icons :
                        state.icons.filter(i => i.term.indexOf(action.filter) >= 0)
                };
            case FILTER_SHAPES:
                return {
                    ...state,
                    shapesFilter: action.filter,
                    shapesFiltered: action.length === 0 ?
                        state.shapes :
                        state.shapes.filter(i => i.key.indexOf(action.filter) >= 0)
                };
            default:
                return state;
        }
    };

    return reducer;
}