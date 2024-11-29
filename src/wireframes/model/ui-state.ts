/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

export interface UIState {
    // The error toast from any loading operation.
    errorToast?: string;

    // The info toast from any loading operation.
    infoToast?: string;

    // Indicates if the left sidebar is open.
    showLeftSidebar: boolean;

    // Indicates if the right sidebar is open.
    showRightSidebar: boolean;

    // The selected tab on the left sidebar.
    selectedTab: string;

    // The color tab.
    selectedColorTab: string;

    // Indicates if WebGL should be used for rendering.
    useWebGL: boolean;

    // The filter for the diagram.
    diagramsFilter?: string;
}

const WEBGL_KEY = 'webgl';

export function loadWebGLState() {
    try {
        const value = localStorage.getItem(WEBGL_KEY);

        return !!value;
    } catch {
        return false;
    }
}

export function saveWebGLState(value: boolean) {
    try {
        if (value) {
            localStorage.setItem(WEBGL_KEY, 'true');
        } else {
            localStorage.removeItem(WEBGL_KEY);
        }
    } catch {
    }
}

export interface UIStateInStore {
    ui: UIState;
}

export const createInitialUIState: () => UIState = () => {
    return {
        selectedTab: 'shapes',
        showLeftSidebar: true,
        showRightSidebar: true,
        selectedColorTab: 'palette',
        useWebGL: loadWebGLState(),
    };
};
