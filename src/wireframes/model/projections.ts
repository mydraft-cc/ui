import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';

import { AssetsStateInStore } from './assets-state';
import { Configurable } from './configurables';
import { DiagramItem } from './diagram-item';
import { DiagramItemSet } from './diagram-item-set';
import { EditorStateInStore } from './editor-state';
import { LoadingStateInStore } from './loading-state';
import { UIStateInStore } from './ui-state';

const EMPTY_STRING_ARRAY: string[] = [];
const EMPTY_ITEMS_ARRAY: DiagramItem[] = [];
const EMPTY_CONFIGURABLES: Configurable[] = [];

export const getIconsFilter = (state: AssetsStateInStore) => state.assets.iconsFilter;
export const getIconSet = (state: AssetsStateInStore) => state.assets.iconSet;
export const getIcons = (state: AssetsStateInStore) => state.assets.icons;
export const getShapesFilter = (state: AssetsStateInStore) => state.assets.shapesFilter;
export const getShapes = (state: AssetsStateInStore) => state.assets.shapes;

export const getIconSets = createSelector(
    getIcons,
    icons => Object.keys(icons)
);

export const getSelectedIcons = createSelector(
    getIcons,
    getIconSet,
    (icons, set) => icons[set]
);

export const getFilteredIcons = createSelector(
    getSelectedIcons,
    getIconsFilter,
    (icons, filter) => filter && filter.length > 0 ? icons.filter(x => x.displaySearch.indexOf(filter) >= 0) : icons
);

export const getFilteredShapes = createSelector(
    getShapes,
    getShapesFilter,
    (shapes, filter) => filter && filter.length > 0 ? shapes.filter(x => x.displaySearch.indexOf(filter) >= 0) : shapes
);

export const getEditor = (state: EditorStateInStore) => state.editor.present;
export const getDiagrams = (state: EditorStateInStore) => state.editor.present.diagrams;
export const getDiagramId = (state: EditorStateInStore) => state.editor.present.selectedDiagramId;

export const getDiagram = createSelector(
    getDiagrams,
    getDiagramId,
    (diagrams, id) => diagrams.get(id)
);

export const getSelectionSet = createSelector(
    getDiagram,
    diagram => diagram ? DiagramItemSet.createFromDiagram(diagram.selectedIds.values, diagram) : null
);

export const getSelectedIds = createSelector(
    getDiagram,
    diagram => diagram ? diagram.selectedIds.values : EMPTY_STRING_ARRAY
);

export const getSelectedItemsWithLocked = createSelector(
    getDiagram,
    diagram => diagram ? diagram.selectedIds.values.map(i => diagram!.items.get(i)) : EMPTY_ITEMS_ARRAY
);

export const getSelectedItems = createSelector(
    getSelectedItemsWithLocked,
    items => items.filter(x => !x.isLocked)
);

export const getSelectedGroups = createSelector(
    getSelectedItems,
    items => items.filter(i => i.type === 'Group')
);

export const getSelectedItemWithLocked = createSelector(
    getSelectedItemsWithLocked,
    items => items.length === 1 ? items[0] : null
);

export const getSelectedShape = createSelector(
    getSelectedItems,
    items => items.length === 1 && items[0].type === 'Shape' ? items[0] : null
);

export const getSelectedConfigurables = createSelector(
    getSelectedShape,
    shape => shape ? shape.configurables : EMPTY_CONFIGURABLES
);

export interface UniqueValue<TValue> {
    value?: TValue;

    empty: boolean;
}

type Comparer<TComparand> = (lhs: TComparand, rhs: TComparand) => boolean;

type Parser<TInput> = (value: any) => TInput | undefined;

const DEFAULT_COMPARER: Comparer<any> = (lhs, rhs) => lhs === rhs;
const DEFAULT_PARSER = (value: any) => value;

export function uniqueAppearance<T>(set: DiagramItemSet, key: string, parse?: Parser<T>, compare?: Comparer<T>): UniqueValue<T> {
    if (!set) {
        return { empty: true };
    }

    if (!compare) {
        compare = DEFAULT_COMPARER;
    }

    if (!parse) {
        parse = DEFAULT_PARSER;
    }

    let value: T | undefined = undefined;

    let hasValue = false;

    for (let visual of set!.allVisuals) {
        const appearance = visual.appearance.get(key);

        if (appearance) {
            hasValue = true;

            const parsed = parse(appearance);

            if (parsed && value && !compare(value, parsed)) {
                value = undefined;
            } else {
                value = parsed;
            }
        }
    }

    return { value, empty: !hasValue };
}

type State = AssetsStateInStore & EditorStateInStore & UIStateInStore & LoadingStateInStore;

export function useStore<T> (selector: ((state: State) => T)) {
    return useSelector<State, T>(p => selector(p));
}