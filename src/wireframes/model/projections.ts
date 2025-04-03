/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { Color, ColorPalette, Types } from '@app/core/utils';
import { texts } from '@app/texts';
import { addDiagram, addShape, changeDiagramColors, changeColors, changeItemsAppearance, pasteItems, removeDiagram, removeItems } from './actions';
import { AssetsStateInStore } from './assets-state';
import { Diagram } from './diagram';
import { DiagramItemSet } from './diagram-item-set';
import { EditorState, EditorStateInStore } from './editor-state';
import { LoadingStateInStore } from './loading-state';
import { UIStateInStore } from './ui-state';
import { UndoableState } from './undoable-state';

const EMPTY_SELECTION_SET = DiagramItemSet.EMPTY;

// Base selectors
export const getDiagramId = (state: EditorStateInStore) => state.editor.present.selectedDiagramId;
export const getDiagrams = (state: EditorStateInStore) => state.editor.present.diagrams;
export const getDiagramsFilter = (state: UIStateInStore) => state.ui.diagramsFilter;
export const getEditorRoot = (state: EditorStateInStore) => state.editor;
export const getEditor = (state: EditorStateInStore) => state.editor.present;
export const getIcons = (state: AssetsStateInStore) => state.assets.icons;
export const getIconSet = (state: AssetsStateInStore) => state.assets.iconSet;
export const getIconsFilter = (state: AssetsStateInStore) => state.assets.iconsFilter;
export const getOrderedDiagrams = (state: EditorStateInStore) => state.editor.present.orderedDiagrams;
export const getShapes = (state: AssetsStateInStore) => state.assets.shapes;
export const getShapesFilter = (state: AssetsStateInStore) => state.assets.shapesFilter;

// Memoized selectors
export const getIconsFilterRegex = createSelector(
    getIconsFilter,
    filter => new RegExp(filter || '.*', 'i'),
);

export const getShapesFilterRegex = createSelector(
    getShapesFilter,
    filter => new RegExp(filter || '.*', 'i'),
);

export const getDiagramsFilterRegex = createSelector(
    getDiagramsFilter,
    filter => new RegExp(filter || '.*', 'i'),
);

export const getIconSets = createSelector(
    getIcons,
    icons => Object.keys(icons),
);

export const getSelectedIcons = createSelector(
    getIcons,
    getIconSet,
    (icons, set) => icons[set],
);

export const getFilteredIcons = createSelector(
    getSelectedIcons,
    getIconsFilterRegex,
    (icons, filter) => icons.filter(x => filter.test(x.displaySearch)),
);

export const getFilteredShapes = createSelector(
    getShapes,
    getShapesFilterRegex,
    (shapes, filter) => shapes.filter(x => filter.test(x.displaySearch)),
);

export const getFilteredDiagrams = createSelector(
    getOrderedDiagrams,
    getDiagramsFilterRegex,
    (diagrams, filter) => diagrams.filter((x, index) => filter.test(getPageName(x, index))),
);

export const getDiagram = createSelector(
    getDiagrams,
    getDiagramId,
    (diagrams, id) => diagrams.get(id!),
);

export const getMasterDiagram = createSelector(
    getDiagrams,
    getDiagram,
    (diagrams, diagram) => diagrams.get(diagram?.master!),
);

export const getSelection = createSelector(
    getDiagram,
    diagram => diagram ? DiagramItemSet.createFromDiagram(diagram.selectedIds.values, diagram) : EMPTY_SELECTION_SET,
);

// Create a stable reference for the color palette
const createColorPalette = (colors: { [color: string]: { count: number; color: Color } }) => {
    const sorted = Object.entries(colors).sort((x, y) => y[1].count - x[1].count);
    return new ColorPalette(sorted.map(x => x[1].color));
};

const EMPTY_COLOR_PALETTE = new ColorPalette([]);

export const getColors = createSelector(
    [getDiagram], // Use getDiagram as the input selector
    (diagram): ColorPalette => { // Input is now the selected diagram
        if (!diagram) {
            // Return an empty, stable palette if no diagram is selected
            return EMPTY_COLOR_PALETTE;
        }

        const colors: { [color: string]: { count: number; color: Color } } = {};

        const addColor = (value: any) => {
            // Check if value is null or undefined before processing
            if (value === null || value === undefined) {
                return;
            }

            const color = Color.fromValue(value);
            // Ensure we don't add invalid colors (e.g., from invalid input values)
            // The fromValue method likely handles returning a default or specific instance for invalid inputs,
            // or the subsequent toString() would reveal issues. Let ColorPalette handle potential duplicates.

            let colorKey = color.toString();
            let colorEntry = colors[colorKey];

            if (!colorEntry) {
                colorEntry = { count: 1, color };
                colors[colorKey] = colorEntry;
            } else {
                colorEntry.count++;
            }
        };

        // Add colors from the diagram's theme only if they are explicitly set
        const theme = diagram.theme;
        if (theme) {
            // Only add backgroundColor if it's explicitly set (not using default)
            if (theme.backgroundColor !== null) {
                addColor(theme.backgroundColor);
            }
            
            const settings = theme.themeSettings;
            if (settings) {
                // Only add theme settings colors if they differ from the default theme
                const defaultTheme = Diagram.createDefaultTheme();
                if (!settings.borderColor.eq(defaultTheme.themeSettings.borderColor)) {
                    addColor(settings.borderColor);
                }
                if (!settings.gridColor.eq(defaultTheme.themeSettings.gridColor)) {
                    addColor(settings.gridColor);
                }
            }
        }

        // Add colors from the shapes in the selected diagram
        for (const shape of diagram.items.values) {
            if (shape.type === 'Group') {
                continue;
            }
            
            for (const [key, value] of shape.appearance.entries) {
                if (key.endsWith('COLOR')) {
                    addColor(value);
                }
            }
        }

        return createColorPalette(colors);
    },
    // Remove custom memoizeOptions, rely on default createSelector behavior based on diagram reference
);

export function getPageName(diagram: Diagram | string, index: number): string {
    if (Types.isString(diagram)) {
        return diagram;
    }

    return diagram.title || `${texts.common.page} ${index + 1}`;
}

type State = AssetsStateInStore & EditorStateInStore & UIStateInStore & LoadingStateInStore;

export function useStore<T>(selector: ((state: State) => T)) {
    return useSelector(selector, (a, b) => {
        if (a === b) {
            return true;
        }

        if (Array.isArray(a) && Array.isArray(b)) {
            if (a.length !== b.length) {
                return false;
            }
            return a.every((x, i) => x === b[i]);
        }

        return false;
    });
}
