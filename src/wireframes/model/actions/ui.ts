import { Reducer } from 'redux';

import { UIState } from '@app/wireframes/model';

export const COPY = 'COPY';
export const copy: (value: string) => any = (value: string) => {
    return { type: COPY, payload: value };
};

export const SET_ZOOM = 'SET_ZOOM';
export const setZoom: (value: number) => any = (value: number) => {
    return { type: SET_ZOOM, payload: value };
};

export const SELECT_TAB = 'SELECT_TAB';
export const selectTab: (value: string) => any = (value: string) => {
    return { type: SELECT_TAB, payload: value };
};

export const TOGGLE_SHOW_LEFT_SIDEBAR = 'TOGGLE_SHOW_LEFT_SIDEBAR';
export const toggleLeftSidebar: () => any = () => {
    return { type: TOGGLE_SHOW_LEFT_SIDEBAR };
};

export const TOGGle_RIGHT_SIDEBAR = 'TOGGle_RIGHT_SIDEBAR';
export const toggleRightSidebar: () => any = () => {
    return { type: TOGGle_RIGHT_SIDEBAR };
};

export function ui(initialState: UIState): Reducer<UIState> {
    const reducer: Reducer<UIState> = (state: UIState = initialState, action: any) => {
        switch (action.type) {
            case SET_ZOOM:
                return {...state, zoom: action.payload };
            case COPY:
                return {...state, clipboard: action.payload };
            case SELECT_TAB:
                return {...state, selectedTab: action.payload };
            case TOGGLE_SHOW_LEFT_SIDEBAR:
                return {...state, showLeftSidebar: !state.showLeftSidebar };
            case TOGGle_RIGHT_SIDEBAR:
                return {...state, showRightSidebar: !state.showRightSidebar };
            default:
                return state;
        }
    };

    return reducer;
}