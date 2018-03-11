export interface UIState {
    zoom: number;

    selectedTab: string;

    showLeftSidebar: boolean;

    showRightSidebar: boolean;
}

export const createInitialUIState: () => UIState = () => {
    return {
        zoom: 1,
        selectedTab: 'shapes',
        showLeftSidebar: true,
        showRightSidebar: true
    };
};