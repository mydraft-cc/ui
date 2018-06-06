import { Reducer } from 'redux';

import { AssetsState } from '@app/wireframes/model';

export const FILTER_SHAPES = 'FILTER_SHAPES';
export const filterShapes: (value: string) => any = (value: string) => {
    return { type: FILTER_SHAPES, payload: value };
};

export const FILTER_ICONS = 'FILTER_ICONS';
export const filterIcons: (value: string) => any = (value: string) => {
    return { type: FILTER_ICONS, payload: value };
};

export function assets(initialState: AssetsState): Reducer<AssetsState> {
    const reducer: Reducer<AssetsState> = (state: AssetsState = initialState, action: any) => {
        switch (action.type) {
            case FILTER_ICONS:
                return {
                    ...state,
                    iconsFilter: action.payload,
                    iconsFiltered: action.length === 0 ?
                        state.icons :
                        state.icons.filter(i => i.term.indexOf(action.payload) >= 0)
                };
            case FILTER_SHAPES:
                return {
                    ...state,
                    shapesFilter: action.payload,
                    shapesFiltered: action.length === 0 ?
                        state.shapes :
                        state.shapes.filter(i => i.key.indexOf(action.payload) >= 0)
                };
            default:
                return state;
        }
    };

    return reducer;
}