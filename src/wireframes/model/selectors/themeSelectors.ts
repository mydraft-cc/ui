import { createSelector } from '@reduxjs/toolkit';
import type { AppState } from '@app/store';
import type { ThemeState } from '../actions/theme'; // Adjust path if needed

// Create base selector for theme state
const selectThemeState = (state: AppState): ThemeState => state.theme;

// Create memoized selector for effective theme
export const selectEffectiveTheme = createSelector(
    selectThemeState,
    (theme): 'light' | 'dark' => {
        if (theme.mode === 'system') {
            return theme.systemPrefersDark ? 'dark' : 'light';
        }
        return theme.mode === 'dark' ? 'dark' : 'light';
    }
);
