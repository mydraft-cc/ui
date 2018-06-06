export interface LoadingState {
    // Indicates if the loading operation is in progress.
    isLoading: boolean;

    // Indicates if the saving operation is in progress.
    isSaving: boolean;

    // The error from any loading operation.
    error?: string | null;

    // The read token.
    tokenRead?: string | null;

    // The write token.
    tokenWrite?: string | null;
}

export interface LoadingStateInStore {
    loading: LoadingState;
}

export const createInitialLoadingState: () => LoadingState = () => {
    return {
        isLoading: false,
        isSaving: false
    };
};