/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ImmutableList, ImmutableMap, ImmutableSet, Record, Types } from '@app/core';
import { DiagramContainer } from './diagram-container';
import { DiagramItem } from './diagram-item';
import { DiagramItemSet } from './diagram-item-set';

type Props = {
    // The unique id of the diagram.
    id: string;

    // The optional title.
    title?: string;

    // The list of items.
    items: ImmutableMap<DiagramItem>;

    // The rootIds ids.
    itemIds: DiagramContainer;

    // The selected ids.
    selectedIds: ImmutableSet;
};

export class Diagram extends Record<Props> {
    private parents: { [id: string]: DiagramItem };

    public get id() {
        return this.get('id');
    }

    public get title() {
        return this.get('title');
    }

    public get items() {
        return this.get('items');
    }

    public get itemIds() {
        return this.get('itemIds');
    }

    public get selectedIds() {
        return this.get('selectedIds');
    }

    public get rootItems(): ReadonlyArray<DiagramItem> {
        return this.itemIds.values.map(x => this.items.get(x));
    }

    public static empty(id: string) {
        const props: Props = {
            id,
            items: ImmutableMap.empty(),
            itemIds: ImmutableList.empty(),
            selectedIds: ImmutableSet.empty(),
        };

        return new Diagram(props);
    }

    public rename(title: string | undefined) {
        return this.set('title', title);
    }

    public parent(id: string | DiagramItem) {
        if (!id) {
            return undefined;
        }

        if (Types.is(id, DiagramItem)) {
            id = id.id;
        }

        if (!this.parents) {
            this.parents = {};

            for (const key of this.items.keys) {
                const item = this.items.get(key);

                if (item.type === 'Group') {
                    for (const childId of item.childIds.values) {
                        this.parents[childId] = item;
                    }
                }
            }
        }

        return this.parents[id];
    }

    public addVisual(visual: DiagramItem) {
        if (!visual || this.items.get(visual.id)) {
            return this;
        }

        return this.mutate([], ({ itemIds: rootIds, items }) => {
            items = items.set(visual.id, visual);

            if (items !== this.items) {
                rootIds = rootIds.add(visual.id);
            }

            return { items, itemIds: rootIds };
        });
    }

    public selectItems(ids: ReadonlyArray<string>) {
        return this.mutate(ids, () => {
            const selectedIds = ImmutableSet.of(...ids);

            return { selectedIds };
        });
    }

    public bringToFront(ids: ReadonlyArray<string>) {
        return this.mutate(ids, ({ itemIds: rootIds }) => {
            rootIds = rootIds.bringToFront(ids);

            return { itemIds: rootIds };
        });
    }

    public bringForwards(ids: ReadonlyArray<string>) {
        return this.mutate(ids, ({ itemIds: rootIds }) => {
            rootIds = rootIds.bringForwards(ids);

            return { itemIds: rootIds };
        });
    }

    public sendToBack(ids: ReadonlyArray<string>) {
        return this.mutate(ids, ({ itemIds: rootIds }) => {
            rootIds = rootIds.sendToBack(ids);

            return { itemIds: rootIds };
        });
    }

    public sendBackwards(ids: ReadonlyArray<string>) {
        return this.mutate(ids, ({ itemIds: rootIds }) => {
            rootIds = rootIds.sendBackwards(ids);

            return { itemIds: rootIds };
        });
    }

    public updateItem(id: string, updater: (value: DiagramItem) => DiagramItem) {
        return this.mutate([id], ({ items }) => {
            items = items.update(id, updater);

            return { items };
        });
    }

    public group(groupId: string, ids: ReadonlyArray<string>) {
        return this.mutate(ids, ({ itemIds: rootIds, items }) => {
            rootIds = rootIds.add(groupId).remove(...ids);

            items = items.set(groupId, DiagramItem.createGroup(groupId, ids));

            return { items, itemIds: rootIds };
        });
    }

    public ungroup(groupId: string) {
        return this.mutate([groupId], ({ itemIds: rootIds, items }) => {
            rootIds = rootIds.add(...items.get(groupId).childIds.values).remove(groupId);

            items = items.remove(groupId);

            return { items, itemIds: rootIds };
        });
    }

    public addItems(set: DiagramItemSet): Diagram {
        if (!set.canAdd(this)) {
            return this;
        }

        return this.mutate([], ({ itemIds: rootIds, items }) => {
            items = items.mutate(m => {
                for (const item of set.allItems) {
                    m.set(item.id, item);
                }
            });

            rootIds = rootIds.add(...set.rootIds);

            return { items, itemIds: rootIds };
        });
    }

    public removeItems(set: DiagramItemSet): Diagram {
        if (!set.canRemove(this)) {
            return this;
        }

        return this.mutate([], ({ itemIds: rootIds, items, selectedIds }) => {
            items = items.mutate(m => {
                for (const id of set.allIds) {
                    m.remove(id);
                }
            });

            selectedIds = selectedIds.mutate(m => {
                for (const id of set.allIds) {
                    m.remove(id);
                }
            });

            rootIds = rootIds.remove(...set.rootIds);

            return { items, itemIds: rootIds, selectedIds };
        });
    }

    private mutate(itemIds: ReadonlyArray<string>, updater: (diagram: Props) => Partial<Props>): Diagram {
        const items = this.findItems(itemIds);

        if (!items) {
            return this;
        }

        const parent = this.parent(items[0]);

        const rootIds = parent ? parent.childIds : this.itemIds;

        const update = updater({ itemIds: rootIds, items: this.items, selectedIds: this.selectedIds, id: this.id });

        if (update.itemIds && parent) {
            update.items = update.items || this.items;
            update.items = update.items.update(parent.id, p => p.set('childIds', update.itemIds));

            delete update.itemIds;
        }

        return this.merge(update);
    }

    private findItems(itemIds: ReadonlyArray<string>): DiagramItem[] | null {
        if (!itemIds) {
            return null;
        }

        const result: DiagramItem[] = [];

        const firstParent = this.parent(itemIds[0]);

        for (const itemId of itemIds) {
            const item = this.items.get(itemId);

            if (!item) {
                return null;
            }

            if (this.parent(itemId) !== firstParent) {
                return null;
            }

            result.push(item);
        }

        return result;
    }
}
