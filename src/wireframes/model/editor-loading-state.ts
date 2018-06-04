export interface EditorLoadingState {
    isLoading: boolean;
    isSaving: boolean;

    error?: string | null;

    tokenRead?: string | null;
    tokenWrite?: string | null;
}

export const createInitialEditorLoadingState: () => EditorLoadingState = () => {
    return {
        isLoading: false,
        isSaving: false
    };
};