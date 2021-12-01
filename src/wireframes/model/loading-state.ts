/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

export interface LoadingState {
    // Indicates if the loading operation is in progress.
    isLoading: boolean;

    // Indicates if the saving operation is in progress.
    isSaving: boolean;

    // The read token.
    tokenToRead?: string | null;

    // The write token.
    tokenToWrite?: string | null;
}

export interface LoadingStateInStore {
    loading: LoadingState;
}

export const createInitialLoadingState: () => LoadingState = () => {
    return {
        isLoading: false,
        isSaving: false,
    };
};
