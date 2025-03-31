/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

// Define a theme type for clarity
export type Theme = 'light' | 'dark';

// Default to light theme initially
let currentTheme: Theme = 'light';

// Listener collection to notify when theme changes
type ThemeChangeListener = (theme: Theme) => void;
const themeChangeListeners: ThemeChangeListener[] = [];

// Function to update the current theme (called by app on initialization/changes)
export const updateCurrentTheme = (theme: Theme) => {
    console.debug(`Theme changing from ${currentTheme} to ${theme}`);
    const previousTheme = currentTheme;
    currentTheme = theme;
    
    // If theme changed, notify listeners
    if (previousTheme !== theme) {
        themeChangeListeners.forEach(listener => listener(theme));
        return true;
    }
    
    return false;
};

// Add a listener for theme changes
export const addThemeChangeListener = (listener: ThemeChangeListener) => {
    themeChangeListeners.push(listener);
    
    // Immediately invoke with current theme to ensure the listener is up-to-date
    listener(currentTheme);
    
    // Return unsubscribe function
    return () => {
        const index = themeChangeListeners.indexOf(listener);
        if (index !== -1) {
            themeChangeListeners.splice(index, 1);
        }
    };
};

// Get the current effective theme value
export const getCurrentTheme = (): Theme => {
    return currentTheme;
};

// Get theme-aware colors for shape rendering
export const getShapeThemeColors = () => {
    const isDark = getCurrentTheme() === 'dark';
    
    return {
        CONTROL_FONT_SIZE: 16,
        CONTROL_BACKGROUND_COLOR: isDark ? 0x333333 : 0xF0F0F0,
        CONTROL_BORDER_THICKNESS: 1,
        CONTROL_BORDER_COLOR: isDark ? 0x505050 : 0xc9c9c9,
        CONTROL_BORDER_RADIUS: 4,
        CONTROL_TEXT_COLOR: isDark ? 0xe0e0e0 : 0x252525,
    };
};

// Get a theme-aware color value for a specific element
export const getThemeAwareColor = (lightColor: number, darkColor: number): number => {
    const isDark = getCurrentTheme() === 'dark';
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
export const getShapeBackgroundColor = (): number => {
    const isDark = getCurrentTheme() === 'dark';
    return isDark ? SHAPE_BACKGROUND_COLOR.DARK : SHAPE_BACKGROUND_COLOR.LIGHT;
};

export const getShapeTextColor = (): number => {
    const isDark = getCurrentTheme() === 'dark';
    return isDark ? SHAPE_TEXT_COLOR.DARK : SHAPE_TEXT_COLOR.LIGHT;
};

// Force a theme change notification without changing the theme
// This is useful for debugging or forcing a re-render
export const forceTriggerThemeChange = () => {
    console.debug(`Force triggering theme change notification for current theme: ${currentTheme}`);
    // Notify all listeners with the current theme 
    themeChangeListeners.forEach(listener => listener(currentTheme));
};

// Force a repaint of a specific shape with current theme values
export const forceRepaintShape = (shape: any, engineItem: any) => {
    if (shape && engineItem && typeof engineItem.forceReplot === 'function') {
        engineItem.forceReplot(shape);
        return true;
    }
    return false;
}; 