/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ImmutableList, ImmutableMap, ImmutableSet, MathHelper, Record, Types } from '@app/core/utils';
import { DiagramItem } from './diagram-item';
import { DiagramItemSet } from './diagram-item-set';
import { Color } from '@app/core/utils';

type Items = ImmutableMap<DiagramItem>;
type ItemIds = ImmutableList<string>;

export interface DiagramTheme {
    backgroundColor: Color | null;
    designTheme: 'light' | 'dark';
    themeSettings: {
        borderColor: Color;
        gridColor: Color;
        // Add other theme-specific settings
    }
}

type UpdateProps = {
    // The list of items.
    items: Items;

    // The item ids.
    itemIds: ItemIds;

    // The selected ids.
    selectedIds: ImmutableSet<string>;
};

type Props = {
    // The unique id of the diagram.
    id: string;

    // The optional title.
    title?: string;

    // The list of items.
    items: Items;

    // The root ids.
    rootIds: ItemIds;

    // The selected ids.
    selectedIds: ImmutableSet<string>;

    // Set the master diagram.
    master?: string;

    // Theme settings for the diagram.
    theme?: DiagramTheme;
};

export type InitialDiagramProps = {
    // The unique id of the diagram.
    id?: string;

    // The optional title.
    title?: string;

    // The list of items.
    items?: { [id: string]: DiagramItem } | Items;

    // The rootIds ids.
    rootIds?: ReadonlyArray<string> | ItemIds;

    // Set the master diagram.
    master?: string;

    // Theme settings for the diagram.
    theme?: DiagramTheme;
};

export class Diagram extends Record<Props> {
    private cachedParents?: { [id: string]: DiagramItem };
    private cachedRootItems?: DiagramItem[];

    public get id() {
        return this.get('id');
    }

    public get title() {
        return this.get('title');
    }

    public get items() {
        return this.get('items');
    }

    public get rootIds() {
        return this.get('rootIds');
    }

    public get selectedIds() {
        return this.get('selectedIds');
    }

    public get master() {
        return this.get('master');
    }

    public get theme() {
        return this.get('theme');
    }

    public get rootItems(): ReadonlyArray<DiagramItem> {
        return this.cachedRootItems ||= this.findItems(this.rootIds.values);
    }

    public static create(setup: InitialDiagramProps = {}) {
        const { id, items, rootIds, master, title } = setup;

        const props: Props = {
            id: id || MathHelper.nextId(),
            items: ImmutableMap.of(items),
            master,
            rootIds: ImmutableList.of(rootIds),
            selectedIds: ImmutableSet.empty(),
            title,
        };

        return new Diagram(props);
    }

    public children(item: DiagramItem): ReadonlyArray<DiagramItem> {
        return this.findItems(item.childIds.values);
    }

    public findItems(ids: ReadonlyArray<string>) {
        const result: DiagramItem[] = [];

        for (const id of ids) {
            const item = this.items.get(id);

            if (item) {
                result.push(item);
            }
        }

        return result;
    }

    public rename(title: string | undefined) {
        return this.set('title', title);
    }

    public setMaster(master: string | undefined) {
        return this.set('master', master);
    }

    public updateAllItems(updater: (value: DiagramItem) => DiagramItem) {
        return this.set('items', this.items.updateAll(updater));
    }

    public clone() {
        // Clone the diagram with a new ID and copy the theme
        const newDiagram = this.set('id', MathHelper.guid());
        if (this.theme) {
            // Create a deep copy of the theme to ensure independence
            return newDiagram.set('theme', {
                ...this.theme,
                backgroundColor: this.theme.backgroundColor ? new Color(
                    this.theme.backgroundColor.r,
                    this.theme.backgroundColor.g,
                    this.theme.backgroundColor.b
                ) : null,
                themeSettings: {
                    ...this.theme.themeSettings,
                    borderColor: new Color(
                        this.theme.themeSettings.borderColor.r,
                        this.theme.themeSettings.borderColor.g,
                        this.theme.themeSettings.borderColor.b
                    ),
                    gridColor: new Color(
                        this.theme.themeSettings.gridColor.r,
                        this.theme.themeSettings.gridColor.g,
                        this.theme.themeSettings.gridColor.b
                    )
                }
            });
        }
        return newDiagram;
    }

    public parent(id: string | DiagramItem) {
        if (!id) {
            return undefined;
        }

        if (Types.is(id, DiagramItem)) {
            id = id.id;
        }

        if (!this.cachedParents) {
            this.cachedParents = {};

            for (const key of this.items.keys) {
                const item = this.items.get(key);

                if (item?.type === 'Group') {
                    for (const childId of item.childIds.values) {
                        this.cachedParents[childId] = item;
                    }
                }
            }
        }

        return this.cachedParents[id];
    }

    public addShape(shape: DiagramItem) {
        if (!shape || this.items.get(shape.id)) {
            return this;
        }

        return this.arrange([], update => {
            update.items = update.items.set(shape.id, shape);

            if (update.items !== this.items) {
                update.itemIds = update.itemIds.add(shape.id);
            }
        });
    }

    public updateItems(ids: ReadonlyArray<string>, updater: (value: DiagramItem) => DiagramItem) {
        return this.arrange(EMPTY_SELECTION, update => {
            update.items = update.items.mutate(mutator => {
                for (const id of ids) {
                    mutator.update(id, updater);
                }
            });
        });
    }

    public selectItems(ids: ReadonlyArray<string>) {
        return this.arrange(ids, update => {
            update.selectedIds = ImmutableSet.of(...ids);
        });
    }

    public moveItems(ids: ReadonlyArray<string>, index: number) {
        return this.arrange(ids, update => {
            update.itemIds = update.itemIds.moveTo(ids, index);
        }, 'SameParent');
    }

    public bringToFront(ids: ReadonlyArray<string>) {
        return this.arrange(ids, update => {
            update.itemIds = update.itemIds.bringToFront(ids);
        }, 'SameParent');
    }

    public bringForwards(ids: ReadonlyArray<string>) {
        return this.arrange(ids, update => {
            update.itemIds = update.itemIds.bringForwards(ids);
        }, 'SameParent');
    }

    public sendToBack(ids: ReadonlyArray<string>) {
        return this.arrange(ids, update => {
            update.itemIds = update.itemIds.sendToBack(ids);
        }, 'SameParent');
    }

    public sendBackwards(ids: ReadonlyArray<string>) {
        return this.arrange(ids, update => {
            update.itemIds = update.itemIds.sendBackwards(ids);
        }, 'SameParent');
    }

    public group(groupId: string, ids: ReadonlyArray<string>) {
        return this.arrange(ids, update => {
            update.itemIds = update.itemIds.add(groupId).remove(...ids);
            update.items = update.items.set(groupId, DiagramItem.createGroup({ id: groupId, childIds: ids }));
        }, 'SameParent');
    }

    public ungroup(groupId: string) {
        return this.arrange([groupId], update => {
            const group = this.items.get(groupId)!;

            update.itemIds = update.itemIds.add(...group.childIds.values).remove(groupId);
            update.items = update.items.remove(groupId);
        });
    }

    public addItems(set: DiagramItemSet): Diagram {
        if (!set.canAdd(this)) {
            return this;
        }

        return this.arrange(EMPTY_SELECTION, update => {
            update.items = update.items.mutate(mutator => {
                for (const item of set.nested.values()) {
                    mutator.set(item.id, item);
                }
            });

            update.itemIds = update.itemIds.add(...set.rootIds);
        });
    }

    public removeItems(set: DiagramItemSet): Diagram {
        if (!set.canRemove(this)) {
            return this;
        }

        return this.arrange(EMPTY_SELECTION, update => {
            update.items = update.items.mutate(m => {
                for (const item of set.nested.values()) {
                    m.remove(item.id);
                }
            });

            update.selectedIds = update.selectedIds.mutate(m => {
                for (const id of set.nested.keys()) {
                    m.remove(id);
                }
            });

            update.itemIds = update.itemIds.remove(...set.rootIds);
        });
    }

    public masterDiagrams(diagrams: ImmutableMap<Diagram>): Diagram[] {
        const seenDiagrams = new Set<string>([this.id]);
        const result: Diagram[] = [];
        let masterId = this.master;
        while (masterId !== undefined && !seenDiagrams.has(masterId)) {
            const master = diagrams.get(masterId);
            if (!master) {
                break;
            }
            result.unshift(master);
            seenDiagrams.add(masterId);
            masterId = master.master;
        }
        return result;
    }

    private arrange(targetIds: Iterable<string>, updater: (diagram: UpdateProps) => void, condition?: 'NoCondition' | 'SameParent'): Diagram {
        if (!targetIds) {
            return this;
        }

        let resultParent: DiagramItem | undefined = undefined;
        let index = 0;

        // All items must have the same parent for the update.
        for (const itemId of targetIds) {
            const item = this.items.get(itemId);

            if (!item) {
                return this;
            }

            const parent = this.parent(itemId);

            if (index === 0) {
                resultParent = parent;
            } else if (parent !== resultParent && condition === 'SameParent') {
                return this;
            }

            index++;
        }

        if (resultParent) {
            const update = {
                items: this.items,
                itemIds: resultParent.childIds,
                selectedIds: this.selectedIds,
            };

            updater(update);

            if (update.itemIds !== resultParent.childIds) {
                update.items = update.items.update(resultParent.id, p => p.set('childIds', update.itemIds));
            }

            return this.merge({ items: update.items, selectedIds: update.selectedIds });
        } else {
            const update = {
                items: this.items,
                itemIds: this.rootIds,
                selectedIds: this.selectedIds,
            };

            updater(update);

            return this.merge({ items: update.items, selectedIds: update.selectedIds, rootIds: update.itemIds });
        }
    }

    // Theme-related methods
    public setBackgroundColor(color: Color | null): Diagram {
        const currentTheme = this.theme || this.createDefaultTheme();
        return this.set('theme', {
            ...currentTheme,
            backgroundColor: color
        });
    }

    public setDesignTheme(theme: 'light' | 'dark'): Diagram {
        const currentTheme = this.theme || this.createDefaultTheme();
        return this.set('theme', {
            ...currentTheme,
            designTheme: theme
        });
    }

    public getBackgroundColor(): Color | null {
        return this.theme?.backgroundColor || null;
    }

    public getDesignTheme(): 'light' | 'dark' {
        return this.theme?.designTheme || 'light';
    }

    public getThemeSettings(): DiagramTheme {
        return this.theme || this.createDefaultTheme();
    }

    public updateThemeSettings(settings: Partial<DiagramTheme>): Diagram {
        const currentTheme = this.theme || this.createDefaultTheme();
        return this.set('theme', {
            ...currentTheme,
            ...settings
        });
    }

    public static createDefaultTheme(): DiagramTheme {
        return {
            backgroundColor: null,
            designTheme: 'light',
            themeSettings: {
                borderColor: Color.fromString('#000000'),
                gridColor: Color.fromString('#CCCCCC')
            }
        };
    }

    private createDefaultTheme(): DiagramTheme {
        return Diagram.createDefaultTheme();
    }
}

const EMPTY_SELECTION: ReadonlyArray<string> = [];