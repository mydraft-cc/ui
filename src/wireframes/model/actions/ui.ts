import { Reducer } from 'redux';

import { UIState } from '@app/wireframes/model';

export const COPY = 'COPY';
export const copy: (value: string) => any = (value: string) => {
    return { type: COPY, payload: value };
};

export const ZOOM = 'ZOOM';
export const zoom: (value: number) => any = (value: number) => {
    return { type: COPY, payload: value };
};

export const SELECT_TAB = 'SELECT_TAB';
export const selectTab: (value: string) => any = (value: string) => {
    return { type: COPY, payload: value };
};

export const SET_LEFT_SIDEBAR = 'SET_LEFT_SIDEBAR';
export const setLeftSidebar: (value: boolean) => any = (value: boolean) => {
    return { type: COPY, payload: value };
};

export const SET_RIGHT_SIDEBAR = 'SET_RIGHT_SIDEBAR';
export const setRightSidebar: (value: boolean) => any = (value: boolean) => {
    return { type: COPY, payload: value };
};

export function ui(): Reducer<UIState> {
    const reducer: Reducer<UIState> = (state: UIState, action: any) => {
        switch (action.type) {
            case ZOOM:
                return {...state, zoom: action.payload };
            case COPY:
                return {...state, clipboard: action.payload.zoom };
            case SELECT_TAB:
                return {...state, selectedTab: action.payload.zoom };
            case SET_LEFT_SIDEBAR:
                return {...state, showLeftSidebar: action.payload.zoom };
            case SET_RIGHT_SIDEBAR:
                return {...state, showRightSidebar: action.payload.zoom };
            default:
                return {
                    selectedTab: 'Shapes',
                    clipboard: null,
                    showLeftSidebar: true,
                    showRightSidebar: true,
                    zoom: 1
                };
        }
    };

    return reducer;
}