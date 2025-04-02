import { createSelector } from '@reduxjs/toolkit';
import type { AppState } from '@app/store';
import type { ThemeState } from '../actions/theme';
import type { DesignThemeState } from '../actions/designTheme';
import { AppTheme, DesignTheme } from '@app/wireframes/interface';

// Create base selectors for theme states
const selectThemeState = (state: AppState): ThemeState => state.theme;
const selectDesignThemeState = (state: AppState): DesignThemeState => state.designTheme;

// Create memoized selector for effective app theme
export const selectEffectiveAppTheme = createSelector(
    selectThemeState,
    (theme): AppTheme => {
        if (theme.mode === 'system') {
            return theme.systemPrefersDark ? 'dark' : 'light';
        }
        return theme.mode === 'dark' ? 'dark' : 'light';
    }
);

// Create memoized selector for effective design theme
export const selectEffectiveDesignTheme = createSelector(
    selectDesignThemeState,
    (theme): DesignTheme => theme.mode
);
