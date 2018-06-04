export interface UIState {
    zoom: number;

    showLeftSidebar: boolean;
    showRightSidebar: boolean;

    selectedTab: string;
}

export const createInitialUIState: () => UIState = () => {
    return {
        zoom: 1,
        selectedTab: 'shapes',
        showLeftSidebar: true,
        showRightSidebar: true
    };
};