/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ImmutableMap, ImmutableSet, Record, Types } from '@app/core';
import { DiagramContainer } from './diagram-container';
import { DiagramItem } from './diagram-item';
import { DiagramItemSet } from './diagram-item-set';

type Props = {
    // The unique id of the diagram.
    id: string;

    // The list of items.
    items?: ImmutableMap<DiagramItem>;

    // The selected ids.
    selectedIds?: ImmutableSet;

    // The rootIds ids.
    rootIds?: DiagramContainer;
};

export class Diagram extends Record<Props> {
    private parents: { [id: string]: DiagramItem };

    public get id() {
        return this.get('id');
    }

    public get items() {
        return this.get('items') || ImmutableMap.empty();
    }

    public get rootIds() {
        return this.get('rootIds') || DiagramContainer.empty();
    }

    public get selectedIds() {
        return this.get('selectedIds') || ImmutableSet.empty();
    }

    public get rootItems(): ReadonlyArray<DiagramItem> {
        return this.rootIds.values.map(x => this.items.get(x));
    }

    public static empty(id: string) {
        return new Diagram({ id });
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
        if (!visual) {
            return this;
        }

        return this.mutate([], ({ rootIds, items }) => {
            items = items.set(visual.id, visual);

            if (items !== this.items) {
                rootIds = rootIds.add(visual.id);
            }

            return { items, rootIds };
        });
    }

    public selectItems(ids: ReadonlyArray<string>) {
        return this.mutate(ids, () => {
            const selectedIds = ImmutableSet.of(...ids);

            return { selectedIds };
        });
    }

    public bringToFront(ids: ReadonlyArray<string>) {
        return this.mutate(ids, ({ rootIds }) => {
            rootIds = rootIds.bringToFront(ids);

            return { rootIds };
        });
    }

    public bringForwards(ids: ReadonlyArray<string>) {
        return this.mutate(ids, ({ rootIds }) => {
            rootIds = rootIds.bringForwards(ids);

            return { rootIds };
        });
    }

    public sendToBack(ids: ReadonlyArray<string>) {
        return this.mutate(ids, ({ rootIds }) => {
            rootIds = rootIds.sendToBack(ids);

            return { rootIds };
        });
    }

    public sendBackwards(ids: ReadonlyArray<string>) {
        return this.mutate(ids, ({ rootIds }) => {
            rootIds = rootIds.sendBackwards(ids);

            return { rootIds };
        });
    }

    public updateItem(id: string, updater: (value: DiagramItem) => DiagramItem) {
        return this.mutate([id], ({ items }) => {
            items = items.update(id, updater);

            return { items };
        });
    }

    public group(groupId: string, ids: ReadonlyArray<string>) {
        return this.mutate(ids, ({ rootIds, items }) => {
            rootIds = rootIds.add(groupId).remove(...ids);

            items = items.set(groupId, DiagramItem.createGroup(groupId, ids));

            return { items, rootIds };
        });
    }

    public ungroup(groupId: string) {
        return this.mutate([groupId], ({ rootIds, items }) => {
            rootIds = rootIds.add(...items.get(groupId).childIds.values).remove(groupId);

            items = items.remove(groupId);

            return { items, rootIds };
        });
    }

    public addItems(set: DiagramItemSet): Diagram {
        if (!set.canAdd(this)) {
            return this;
        }

        return this.mutate([], ({ rootIds, items }) => {
            items = items.mutate(m => {
                for (const item of set.allItems) {
                    m.set(item.id, item);
                }
            });

            rootIds = rootIds.add(...set.rootIds);

            return { items, rootIds };
        });
    }

    public removeItems(set: DiagramItemSet): Diagram {
        if (!set.canRemove(this)) {
            return this;
        }

        return this.mutate([], ({ rootIds, items, selectedIds }) => {
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

            return { items, rootIds, selectedIds };
        });
    }

    private mutate(itemIds: ReadonlyArray<string>, updater: (diagram: Props) => Partial<Props>): Diagram {
        const items = this.findItems(itemIds);

        if (!items) {
            return this;
        }

        const parent = this.parent(items[0]);

        const rootIds = parent ? parent.childIds : this.rootIds;

        const update = updater({ rootIds, items: this.items, selectedIds: this.selectedIds, id: this.id });

        if (update.rootIds && parent) {
            update.items = update.items || this.items;
            update.items = update.items.update(parent.id, p => p.set('childIds', update.rootIds));

            delete update.rootIds;
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
