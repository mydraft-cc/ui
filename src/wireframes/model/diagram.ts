/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ImmutableList, ImmutableMap, ImmutableSet, MathHelper, Record, Types } from '@app/core';
import { DiagramItem } from './diagram-item';
import { DiagramItemSet } from './diagram-item-set';

type Items = ImmutableMap<DiagramItem>;
type ItemIds = ImmutableList<string>;

type Props = {
    // The unique id of the diagram.
    id: string;

    // The id which identifies the instance.
    instanceId: string;

    // The optional title.
    title?: string;

    // The list of items.
    items: Items;

    // The itemIds ids.
    itemIds: ItemIds;

    // The selected ids.
    selectedIds: ImmutableSet;

    // Set the master diagram.
    master?: string;
};

export type InitialDiagramProps = {
    // The unique id of the diagram.
    id?: string;

    // The optional title.
    title?: string;

    // The list of items.
    items?: { [id: string]: DiagramItem } | Items;

    // The itemIds ids.
    itemIds?: ReadonlyArray<string> | ItemIds;

    // Set the master diagram.
    master?: string;
};

export class Diagram extends Record<Props> {
    private parents: { [id: string]: DiagramItem } = {};

    public get id() {
        return this.get('id');
    }

    public get instanceId() {
        return this.get('instanceId');
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

    public get master() {
        return this.get('master');
    }

    public get rootItems(): ReadonlyArray<DiagramItem> {
        return this.itemIds.values.map(x => this.items.get(x)).filter(x => !!x) as DiagramItem[];
    }

    public static create(setup: InitialDiagramProps = {}) {
        const { id, items, itemIds, master } = setup;

        const props: Props = {
            id: id || MathHelper.nextId(),
            instanceId: MathHelper.nextId(),
            items: ImmutableMap.of(items),
            itemIds: ImmutableList.of(itemIds),
            selectedIds: ImmutableSet.empty(),
            master,
        };

        return new Diagram(props);
    }

    public rename(title: string | undefined) {
        return this.set('title', title);
    }

    public setMaster(master: string | undefined) {
        return this.set('master', master);
    }

    public children(item: DiagramItem): ReadonlyArray<DiagramItem> {
        return item.childIds.values.map(x => this.items.get(x)!).filter(x => !!x)!;
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

                if (item?.type === 'Group') {
                    for (const childId of item.childIds.values) {
                        this.parents[childId] = item;
                    }
                }
            }
        }

        return this.parents[id];
    }

    public addShape(shape: DiagramItem) {
        if (!shape || this.items.get(shape.id)) {
            return this;
        }

        return this.mutate([], ({ itemIds, items }) => {
            items = items.set(shape.id, shape);

            if (items !== this.items) {
                itemIds = itemIds.add(shape.id);
            }

            return { items, itemIds };
        });
    }

    public selectItems(ids: ReadonlyArray<string>) {
        return this.mutate(ids, () => {
            const selectedIds = ImmutableSet.of(...ids);

            return { selectedIds };
        });
    }

    public moveItems(ids: ReadonlyArray<string>, index: number) {
        return this.mutate(ids, ({ itemIds }) => {
            itemIds = itemIds.moveTo(ids, index);

            return { itemIds };
        });
    }

    public bringToFront(ids: ReadonlyArray<string>) {
        return this.mutate(ids, ({ itemIds }) => {
            itemIds = itemIds.bringToFront(ids);

            return { itemIds };
        });
    }

    public bringForwards(ids: ReadonlyArray<string>) {
        return this.mutate(ids, ({ itemIds }) => {
            itemIds = itemIds.bringForwards(ids);

            return { itemIds };
        });
    }

    public sendToBack(ids: ReadonlyArray<string>) {
        return this.mutate(ids, ({ itemIds }) => {
            itemIds = itemIds.sendToBack(ids);

            return { itemIds };
        });
    }

    public sendBackwards(ids: ReadonlyArray<string>) {
        return this.mutate(ids, ({ itemIds }) => {
            itemIds = itemIds.sendBackwards(ids);

            return { itemIds };
        });
    }

    public updateItems(ids: ReadonlyArray<string>, updater: (value: DiagramItem) => DiagramItem) {
        return this.mutate(ids, ({ items }) => {
            items = items.mutate(mutator => {
                for (const id of ids) {
                    mutator.update(id, updater);
                }
            });

            return { items };
        });
    }

    public group(groupId: string, ids: ReadonlyArray<string>) {
        return this.mutate(ids, ({ itemIds, items }) => {
            itemIds = itemIds.add(groupId).remove(...ids);

            items = items.set(groupId, DiagramItem.createGroup({ id: groupId, childIds: ids }));

            return { items, itemIds };
        });
    }

    public ungroup(groupId: string) {
        return this.mutate([groupId], ({ itemIds, items }, targetItems) => {
            itemIds = itemIds.add(...targetItems[0].childIds?.values).remove(groupId);

            items = items.remove(groupId);

            return { items, itemIds };
        });
    }

    public addItems(set: DiagramItemSet): Diagram {
        if (!set.canAdd(this)) {
            return this;
        }

        return this.mutate([], ({ itemIds, items }) => {
            items = items.mutate(mutator => {
                for (const item of set.allItems) {
                    mutator.set(item.id, item);
                }
            });

            itemIds = itemIds.add(...set.itemIds);

            return { items, itemIds };
        });
    }

    public removeItems(set: DiagramItemSet): Diagram {
        if (!set.canRemove(this)) {
            return this;
        }

        return this.mutate([], ({ itemIds, items, selectedIds }) => {
            items = items.mutate(m => {
                for (const item of set.allItems) {
                    m.remove(item.id);
                }
            });

            selectedIds = selectedIds.mutate(m => {
                for (const item of set.allItems) {
                    m.remove(item.id);
                }
            });

            itemIds = itemIds.remove(...set.itemIds);

            return { items, itemIds, selectedIds };
        });
    }

    private mutate(targetIds: ReadonlyArray<string>, updater: (diagram: Props, targetItems: DiagramItem[]) => Partial<Props>): Diagram {
        const targetItems = this.findItems(targetIds);

        if (!targetItems) {
            return this;
        }

        const parent = this.parent(targetItems[0]);

        // Compute a new instance ID with every change, so we can identity the instance without saving the reference.
        const update = updater({
            id: this.id,
            instanceId: MathHelper.nextId(),
            items: this.items,
            itemIds: parent?.childIds || this.itemIds,
            selectedIds: this.selectedIds, 
        }, targetItems);

        if (update.itemIds && parent) {
            update.items = update.items || this.items;
            update.items = update.items.update(parent.id, p => p.set('childIds', update.itemIds!));

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
