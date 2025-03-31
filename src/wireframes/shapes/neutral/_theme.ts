/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { getCurrentTheme } from './ThemeShapeUtils';

// Common theme constants without dark mode adjustments - these will be overridden based on theme
export const CommonTheme = {
    CONTROL_FONT_SIZE: 16,
    // These values will be overridden at runtime based on theme
    CONTROL_BACKGROUND_COLOR: 0xF0F0F0,
    CONTROL_BORDER_COLOR: 0xc9c9c9,
    CONTROL_BORDER_RADIUS: 4,
    CONTROL_TEXT_COLOR: 0x252525,
    CONTROL_BORDER_THICKNESS: 1,
};

// Get theme-aware colors based on dark mode
export const getThemeColors = () => {
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
