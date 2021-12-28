/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

type RecentDiagrams = { [tokenToRead: string]: RecentDiagramValue };

export interface RecentDiagramValue {
    // The date when it was saved last.
    date: number;

    // The write token.
    tokenToWrite: string;
}

export interface RecentDiagram extends RecentDiagramValue {
    // The read token.
    tokenToRead: string;
}

export interface LoadingState {
    // Indicates if the loading operation is in progress.
    isLoading: boolean;

    // Indicates if the saving operation is in progress.
    isSaving: boolean;

    // The read token.
    tokenToRead?: string | null;

    // The write token.
    tokenToWrite?: string | null;

    // The reacent diagrams.
    recentDiagrams: RecentDiagrams;
}

export interface LoadingStateInStore {
    loading: LoadingState;
}

export function loadRecentDiagrams() {
    try {
        const recent = localStorage.getItem('recent');

        return JSON.parse(recent!) || {} as RecentDiagrams;
    } catch {
        return {};
    }
}

export function saveRecentDiagrams(recent: RecentDiagrams) {
    try {
        const json = JSON.stringify(recent);

        return localStorage.setItem('recent', json);
    } catch {
        return false;
    }
}

export const createInitialLoadingState: () => LoadingState = () => {
    return {
        isLoading: false,
        isSaving: false,
        recentDiagrams: loadRecentDiagrams(),
    };
};
