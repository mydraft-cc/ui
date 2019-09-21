import { message } from 'antd';
import { AnyAction, Dispatch, Middleware, Reducer } from 'redux';

import { UIState } from './../internal';

export const SHOW_INFO_TOAST = 'SHOW_INFO_TOAST';
export const showInfoToast = (text: string) => {
    return { type: SHOW_INFO_TOAST, text };
};

export const SHOW_ERROR_TOAST = 'SHOW_ERROR_TOAST';
export const showErrorToast = (text: string) => {
    return { type: SHOW_ERROR_TOAST, text };
};

export const SET_ZOOM = 'SET_ZOOM';
export const setZoom = (zoomLevel: number) => {
    return { type: SET_ZOOM, zoomLevel };
};

export const SELECT_COLOR_TAB = 'SELECT_COLOR_TAB';
export const selectColorTab = (tab: string) => {
    return { type: SELECT_COLOR_TAB, tab };
};

export const SELECT_TAB = 'SELECT_TAB';
export const selectTab = (tab: string) => {
    return { type: SELECT_TAB, tab };
};

export const TOGGLE_LEFT_SIDEBAR = 'TOGGLE_LEFT_SIDEBAR';
export const toggleLeftSidebar = () => {
    return { type: TOGGLE_LEFT_SIDEBAR };
};

export const TOGGlE_RIGHT_SIDEBAR = 'TOGGle_RIGHT_SIDEBAR';
export const toggleRightSidebar = () => {
    return { type: TOGGlE_RIGHT_SIDEBAR };
};

export function toastMiddleware() {
    const middleware: Middleware = () => (next: Dispatch<AnyAction>) => (action: any) => {
        switch (action.type) {
            case SHOW_INFO_TOAST:
                message.info(action.text);
                break;
            case SHOW_ERROR_TOAST:
                message.error(action.text);
                break;
        }

        return next(action);
    };

    return middleware;
}

export function ui(initialState: UIState): Reducer<UIState> {
    const reducer: Reducer<UIState> = (state = initialState, action: any) => {
        switch (action.type) {
            case SET_ZOOM:
                return { ...state, zoom: action.zoomLevel };
            case SELECT_TAB:
                return { ...state, selectedTab: action.tab };
            case SELECT_COLOR_TAB:
                return { ...state, selectedColorTab: action.tab };
            case TOGGLE_LEFT_SIDEBAR:
                return { ...state, showLeftSidebar: !state.showLeftSidebar };
            case TOGGlE_RIGHT_SIDEBAR:
                return { ...state, showRightSidebar: !state.showRightSidebar };
            default:
                return state;
        }
    };

    return reducer;
}