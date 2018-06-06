export interface UIState {
    // The current zoom level.
    zoom: number;

    // Indicates if the left sidebar is open.
    showLeftSidebar: boolean;

    // Indicates if the right sidebar is open.
    showRightSidebar: boolean;

    // The selected tab on the left sidebar.
    selectedTab: string;
}

export interface UIStateInStore {
    ui: UIState;
}

export const createInitialUIState: () => UIState = () => {
    return {
        zoom: 1,
        selectedTab: 'shapes',
        showLeftSidebar: true,
        showRightSidebar: true
    };
};