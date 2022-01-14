/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { Types } from '@app/core';
import { texts } from '@app/texts';
import { AssetsStateInStore } from './assets-state';
import { Configurable } from './configurables';
import { Diagram } from './diagram';
import { DiagramItem } from './diagram-item';
import { DiagramItemSet } from './diagram-item-set';
import { EditorStateInStore } from './editor-state';
import { LoadingStateInStore } from './loading-state';
import { UIStateInStore } from './ui-state';

const EMPTY_STRING_ARRAY: string[] = [];
const EMPTY_ITEMS_ARRAY: DiagramItem[] = [];
const EMPTY_CONFIGURABLES: Configurable[] = [];

export const getDiagramId = (state: EditorStateInStore) => state.editor.present.selectedDiagramId;
export const getDiagrams = (state: EditorStateInStore) => state.editor.present.diagrams;
export const getDiagramsFilter = (state: UIStateInStore) => state.ui.diagramsFilter;
export const getEditor = (state: EditorStateInStore) => state.editor.present;
export const getIcons = (state: AssetsStateInStore) => state.assets.icons;
export const getIconSet = (state: AssetsStateInStore) => state.assets.iconSet;
export const getIconsFilter = (state: AssetsStateInStore) => state.assets.iconsFilter;
export const getOrderedDiagrams = (state: EditorStateInStore) => state.editor.present.orderedDiagrams;
export const getShapes = (state: AssetsStateInStore) => state.assets.shapes;
export const getShapesFilter = (state: AssetsStateInStore) => state.assets.shapesFilter;

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
    (icons, filter) => icons.filter(x => filter.test(x.displayName)),
);

export const getFilteredShapes = createSelector(
    getShapes,
    getShapesFilterRegex,
    (shapes, filter) => shapes.filter(x => filter.test(x.displayName)),
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

export const getSelectionSet = createSelector(
    getDiagram,
    diagram => (diagram ? DiagramItemSet.createFromDiagram(diagram.selectedIds.values, diagram) : null),
);

export const getSelectedIds = createSelector(
    getDiagram,
    diagram => diagram?.selectedIds.values || EMPTY_STRING_ARRAY,
);

export const getSelectedItemsWithLocked = createSelector(
    getDiagram,
    diagram => diagram?.selectedIds.values.map(i => diagram!.items.get(i)).filter(x => !!x) as DiagramItem[] || EMPTY_ITEMS_ARRAY,
);

export const getSelectedItems = createSelector(
    getSelectedItemsWithLocked,
    items => items.filter(x => !x.isLocked),
);

export const getSelectedGroups = createSelector(
    getSelectedItems,
    items => items.filter(i => i.type === 'Group'),
);

export const getSelectedItemWithLocked = createSelector(
    getSelectedItemsWithLocked,
    items => (items.length === 1 ? items[0] : null),
);

export const getSelectedShape = createSelector(
    getSelectedItems,
    items => (items.length === 1 && items[0].type === 'Shape' ? items[0] : null),
);

export const getSelectedConfigurables = createSelector(
    getSelectedShape,
    shape => (shape ? shape.configurables : EMPTY_CONFIGURABLES),
);

export function getPageName(diagram: Diagram | string, index: number): string {
    let title: string | undefined;

    if (Types.isString(diagram)) {
        title = diagram;
    } else {
        title = diagram.title;
    }

    return title || `${texts.common.page} ${index + 1}`;
}

type State = AssetsStateInStore & EditorStateInStore & UIStateInStore & LoadingStateInStore;

export function useStore<T>(selector: ((state: State) => T)) {
    return useSelector<State, T>(p => selector(p));
}
