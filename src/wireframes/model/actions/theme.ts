import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { useAppSelector } from '../../../store';
import type { AppState } from '../../../store';
import { getThemeColors } from '../../shapes/neutral/_theme';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
    mode: ThemeMode;
    systemPrefersDark: boolean;
}

const getInitialThemeState = (): ThemeState => {
    // Check if theme is saved in localStorage
    const savedTheme = localStorage.getItem('theme-mode');
    const validThemes: ThemeMode[] = ['light', 'dark', 'system'];
    
    // Check system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Use saved theme if valid, otherwise default to system
    const mode = savedTheme && validThemes.includes(savedTheme as ThemeMode) 
        ? savedTheme as ThemeMode 
        : 'system';
    
    return { mode, systemPrefersDark };
};

export const themeSlice = createSlice({
    name: 'theme',
    initialState: getInitialThemeState(),
    reducers: {
        setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
            state.mode = action.payload;
            // Persist to localStorage
            localStorage.setItem('theme-mode', action.payload);
        },
        toggleTheme: (state) => {
            // Toggle between light and dark
            const newMode = state.mode === 'light' ? 'dark' : 'light';
            state.mode = newMode;
            // Persist to localStorage
            localStorage.setItem('theme-mode', newMode);
        },
        updateSystemPreference: (state, action: PayloadAction<boolean>) => {
            state.systemPrefersDark = action.payload;
        }
    }
});

export const { setThemeMode, toggleTheme, updateSystemPreference } = themeSlice.actions;

// Create base selector for theme state
const selectThemeState = (state: AppState) => state.theme;

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

// Hook to get theme-aware control colors
export const useThemeColors = () => {
    const theme = useAppSelector(selectEffectiveTheme);
    return getThemeColors(theme === 'dark');
};

export const theme = themeSlice.reducer; 