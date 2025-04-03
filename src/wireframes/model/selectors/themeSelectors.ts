import { createSelector } from '@reduxjs/toolkit';
import type { AppState } from '@app/store';
import type { ThemeState } from '../actions/theme';
import type { DesignThemeState } from '../actions/designTheme';
import { AppTheme, DesignTheme } from '@app/wireframes/interface';
import { EditorState } from '../editor-state';
import { Diagram, DiagramTheme } from '../diagram';
import { Color } from '@app/core/utils';

// Create base selectors for theme states
const selectThemeState = (state: AppState): ThemeState => state.theme;
const selectDesignThemeState = (state: AppState): DesignThemeState => state.designTheme;
const selectEditorState = (state: AppState): EditorState => state.editor.present;

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

// Create memoized selector for selected diagram theme
export const selectSelectedDiagramTheme = createSelector(
    selectEditorState,
    (editor): DiagramTheme | null => {
        const diagramId = editor.selectedDiagramId;
        return diagramId ? editor.getDiagramTheme(diagramId) : null;
    }
);

// Create memoized selector for selected diagram effective theme
export const selectSelectedDiagramEffectiveTheme = createSelector(
    selectEditorState,
    (editor): DiagramTheme => {
        const diagramId = editor.selectedDiagramId;
        if (!diagramId) {
            // Return a stable reference for the default theme
            return {
                backgroundColor: Color.WHITE,
                designTheme: 'light',
                themeSettings: {
                    borderColor: Color.BLACK,
                    gridColor: Color.BLACK
                }
            };
        }
        return editor.getEffectiveTheme(diagramId);
    }
);

// Create memoized selector for selected diagram background color
export const selectSelectedDiagramBackgroundColor = createSelector(
    selectEditorState,
    (editor): Color | null => {
        const diagramId = editor.selectedDiagramId;
        return diagramId ? editor.getEffectiveBackgroundColor(diagramId) : null;
    }
);

// Create memoized selector for selected diagram design theme
export const selectSelectedDiagramDesignTheme = createSelector(
    selectEditorState,
    (editor): 'light' | 'dark' => {
        const diagramId = editor.selectedDiagramId;
        return diagramId ? editor.getEffectiveDesignTheme(diagramId) : 'light';
    }
);
