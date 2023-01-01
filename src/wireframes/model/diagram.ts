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

    // The root ids.
    rootIds: ItemIds;

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

    // The rootIds ids.
    rootIds?: ReadonlyArray<string> | ItemIds;

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

    public get rootIds() {
        return this.get('rootIds');
    }

    public get selectedIds() {
        return this.get('selectedIds');
    }

    public get master() {
        return this.get('master');
    }

    public get rootItems(): ReadonlyArray<DiagramItem> {
        return this.rootIds.values.map(x => this.items.get(x)).filter(x => !!x) as DiagramItem[];
    }

    public static create(setup: InitialDiagramProps = {}) {
        const { id, items, rootIds, master, title } = setup;

        const props: Props = {
            id: id || MathHelper.nextId(),
            instanceId: MathHelper.nextId(),
            items: ImmutableMap.of(items),
            rootIds: ImmutableList.of(rootIds),
            selectedIds: ImmutableSet.empty(),
            master,
            title,
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

        return this.mutate([], ({ rootIds, items }) => {
            items = items.set(shape.id, shape);

            if (items !== this.items) {
                rootIds = rootIds.add(shape.id);
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

    public moveItems(ids: ReadonlyArray<string>, index: number) {
        return this.mutate(ids, ({ rootIds }) => {
            rootIds = rootIds.moveTo(ids, index);

            return { rootIds };
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
        return this.mutate(ids, ({ rootIds, items }) => {
            rootIds = rootIds.add(groupId).remove(...ids);

            items = items.set(groupId, DiagramItem.createGroup({ id: groupId, childIds: ids }));

            return { items, rootIds };
        });
    }

    public ungroup(groupId: string) {
        return this.mutate([groupId], ({ rootIds, items }, targetItems) => {
            rootIds = rootIds.add(...targetItems[0].childIds?.values).remove(groupId);

            items = items.remove(groupId);

            return { items, rootIds };
        });
    }

    public addItems(set: DiagramItemSet): Diagram {
        if (!set.canAdd(this)) {
            return this;
        }

        return this.mutate([], ({ rootIds, items }) => {
            items = items.mutate(mutator => {
                for (const item of set.allItems) {
                    mutator.set(item.id, item);
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
                for (const item of set.allItems) {
                    m.remove(item.id);
                }
            });

            selectedIds = selectedIds.mutate(m => {
                for (const item of set.allItems) {
                    m.remove(item.id);
                }
            });

            rootIds = rootIds.remove(...set.rootIds);

            return { items, rootIds, selectedIds };
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
            rootIds: parent?.childIds || this.rootIds,
            selectedIds: this.selectedIds, 
        }, targetItems);

        if (update.rootIds && parent) {
            update.items = update.items || this.items;
            update.items = update.items.update(parent.id, p => p.set('childIds', update.rootIds!));

            delete update.rootIds;
        }

        return this.merge(update);
    }

    private findItems(rootIds: ReadonlyArray<string>): DiagramItem[] | null {
        if (!rootIds) {
            return null;
        }

        const result: DiagramItem[] = [];

        const firstParent = this.parent(rootIds[0]);

        for (const itemId of rootIds) {
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
