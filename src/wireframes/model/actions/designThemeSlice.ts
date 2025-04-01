import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppState } from '@app/store'; // Assuming AppState is exported from store

// Define the shape of the design theme state
export interface DesignThemeState {
    mode: 'light' | 'dark';
}

// Define the initial state
const initialState: DesignThemeState = {
    mode: 'light', // Default to light mode
};

// Create the slice
const designThemeSlice = createSlice({
    name: 'designTheme',
    initialState,
    reducers: {
        // Action to set the design theme mode
        setDesignThemeMode: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.mode = action.payload;
            // Persistence logic could be added here later if needed
        },
    },
});

// Export the action creator
export const { setDesignThemeMode } = designThemeSlice.actions;

// Export the reducer
export const designThemeReducer = designThemeSlice.reducer;

// Export a selector to get the design theme mode from the state
export const selectDesignThemeMode = (state: AppState) => state.designTheme.mode; // Ensure AppState has designTheme 