import { Dispatch, Reducer } from 'redux';

import { UIState } from '@app/wireframes/model';

export const SHOW_INFO_TOAST = 'SHOW_INFO_TOAST';
export const showInfoToast = (message: string, hideAfter = 5000) => {
    return (dispatch: Dispatch<any>) => {
        dispatch({ type: SHOW_INFO_TOAST, message });

        setTimeout(() => {
            dispatch({ type: SHOW_INFO_TOAST, message: null });
        }, hideAfter);
    };
};

export const SHOW_ERROR_TOAST = 'SHOW_ERROR_TOAST';
export const showErrorToast = (message: string, hideAfter = 5000) => {
    return (dispatch: Dispatch<any>) => {
        dispatch({ type: SHOW_ERROR_TOAST, message });

        setTimeout(() => {
            dispatch({ type: SHOW_ERROR_TOAST, message: null });
        }, hideAfter);
    };
};

export const SET_ZOOM = 'SET_ZOOM';
export const setZoom = (zoomLevel: number) => {
    return { type: SET_ZOOM, zoomLevel };
};

export const SELECT_TAB = 'SELECT_TAB';
export const selectTab = (tab: string) => {
    return { type: SELECT_TAB, tab };
};

export const TOGGLE_LEFT_SIDEBAR = 'TOGGLE_LEFT_SIDEBAR';
export const toggleLeftSidebar: () => any = () => {
    return { type: TOGGLE_LEFT_SIDEBAR };
};

export const TOGGle_RIGHT_SIDEBAR = 'TOGGle_RIGHT_SIDEBAR';
export const toggleRightSidebar: () => any = () => {
    return { type: TOGGle_RIGHT_SIDEBAR };
};

export function ui(initialState: UIState): Reducer<UIState> {
    const reducer: Reducer<UIState> = (state = initialState, action: any) => {
        switch (action.type) {
            case SET_ZOOM:
                return {...state, zoom: action.zoomLevel };
            case SELECT_TAB:
                return {...state, selectedTab: action.tab };
            case TOGGLE_LEFT_SIDEBAR:
                return {...state, showLeftSidebar: !state.showLeftSidebar };
            case TOGGle_RIGHT_SIDEBAR:
                return {...state, showRightSidebar: !state.showRightSidebar };
            case SHOW_INFO_TOAST:
                return {...state, infoToast: action.message };
            case SHOW_ERROR_TOAST:
                return {...state, errorToast: action.message };
            default:
                return state;
        }
    };

    return reducer;
}