import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type DesignThemeMode = 'light' | 'dark';

export interface DesignThemeState {
    mode: DesignThemeMode;
}

const getInitialDesignThemeState = (): DesignThemeState => {
    // Check if design theme is saved in localStorage
    const savedTheme = localStorage.getItem('design-theme-mode');
    const validThemes: DesignThemeMode[] = ['light', 'dark'];
    
    // Use saved theme if valid, otherwise default to light
    const mode = savedTheme && validThemes.includes(savedTheme as DesignThemeMode) 
        ? savedTheme as DesignThemeMode 
        : 'light';
    
    return { mode };
};

export const designThemeSlice = createSlice({
    name: 'designTheme',
    initialState: getInitialDesignThemeState(),
    reducers: {
        setDesignThemeMode: (state, action: PayloadAction<DesignThemeMode>) => {
            state.mode = action.payload;
            // Persist to localStorage
            localStorage.setItem('design-theme-mode', action.payload);
        },
        toggleDesignTheme: (state) => {
            // Toggle between light and dark
            const newMode = state.mode === 'light' ? 'dark' : 'light';
            state.mode = newMode;
            // Persist to localStorage
            localStorage.setItem('design-theme-mode', newMode);
        }
    }
});

export const { setDesignThemeMode, toggleDesignTheme } = designThemeSlice.actions;

export const designTheme = designThemeSlice.reducer; 