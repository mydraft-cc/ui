/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

// Define a theme type for clarity
export type DesignTheme = 'light' | 'dark'; // Renamed for clarity

// Get theme-aware colors for shape rendering, now accepting theme mode
export const getShapeThemeColors = (designThemeMode: DesignTheme) => {
    const isDark = designThemeMode === 'dark'; // Use passed parameter

    return {
        CONTROL_FONT_SIZE: 16,
        CONTROL_BACKGROUND_COLOR: isDark ? 0x333333 : 0xF0F0F0,
        CONTROL_BORDER_THICKNESS: 1,
        CONTROL_BORDER_COLOR: isDark ? 0x505050 : 0xc9c9c9,
        CONTROL_BORDER_RADIUS: 4,
        CONTROL_TEXT_COLOR: isDark ? 0xe0e0e0 : 0x252525,
    };
};

// Get a theme-aware color value for a specific element, now accepting theme mode
export const getThemeAwareColor = (designThemeMode: DesignTheme, lightColor: number, darkColor: number): number => {
    const isDark = designThemeMode === 'dark'; // Use passed parameter
    return isDark ? darkColor : lightColor;
};

// Constants for default shape properties
export const SHAPE_BACKGROUND_COLOR = {
    LIGHT: 0xFFFFFF,
    DARK: 0x2A2A2A,
};

export const SHAPE_TEXT_COLOR = {
    LIGHT: 0x252525,
    DARK: 0xE0E0E0,
};

// Use static values for initial render, will be updated at runtime
// Now accepting theme mode
export const getShapeBackgroundColor = (designThemeMode: DesignTheme): number => {
    const isDark = designThemeMode === 'dark'; // Use passed parameter
    return isDark ? SHAPE_BACKGROUND_COLOR.DARK : SHAPE_BACKGROUND_COLOR.LIGHT;
};

// Now accepting theme mode
export const getShapeTextColor = (designThemeMode: DesignTheme): number => {
    const isDark = designThemeMode === 'dark'; // Use passed parameter
    return isDark ? SHAPE_TEXT_COLOR.DARK : SHAPE_TEXT_COLOR.LIGHT;
};

// Force a repaint of a specific shape with current theme values
// NOTE: This function might need adjustment depending on how shapes consume the theme.
// For now, it remains, but its direct theme dependency is removed.
// It's assumed the `shape` object passed to forceReplot contains the necessary theme info.
export const forceRepaintShape = (shape: any, engineItem: any) => {
    if (shape && engineItem && typeof engineItem.forceReplot === 'function') {
        engineItem.forceReplot(shape);
        return true;
    }
    return false;
}; 