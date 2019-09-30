import {
    ImmutableMap,
    ImmutableSet,
    Record,
    Types
} from '@app/core';

import { DiagramContainer } from './diagram-container';
import { DiagramItem } from './diagram-item';
import { DiagramItemSet } from './diagram-item-set';

type Props = {
    // The unique id of the diagram.
    id: string;

    // The list of items.
    items: ImmutableMap<DiagramItem>;

    // The selected ids.
    selectedIds: ImmutableSet;

    // The root ids.
    root: DiagramContainer;
};

export class Diagram extends Record<Props> {
    private parents: { [id: string]: DiagramItem };

    public get id() {
        return this.get('id');
    }

    public get items() {
        return this.get('items');
    }

    public get root() {
        return this.get('root');
    }

    public get rootIds() {
        return this.get('root');
    }

    public get rootItems() {
        return this.get('root').values.map(x => this.items.get(x)).filter(x => !!x);
    }

    public get selectedIds() {
        return this.get('selectedIds');
    }

    public static empty(id: string) {
        return new Diagram({ id, items: ImmutableMap.empty(), root: DiagramContainer.empty(), selectedIds: ImmutableSet.empty() });
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

            for (let key of this.items.keys) {
                const item = this.items.get(key);

                if (item.type === 'Group') {
                    for (let childId of item.childIds.values) {
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

        return this.mutate([], ({ root, items }) => {
            items = items.set(visual.id, visual);

            if (items !== this.items) {
                root = root.add(visual.id);
            }

            return { items, root };
        });
    }

    public selectItems(ids: string[]) {
        return this.mutate(ids, () => {
            const selectedIds = ImmutableSet.of(...ids);

            return { selectedIds };
        });
    }

    public bringToFront(ids: string[]) {
        return this.mutate(ids, ({ root }) => {
            root = root.bringToFront(ids);

            return { root };
        });
    }

    public bringForwards(ids: string[]) {
        return this.mutate(ids, ({ root }) => {
            root = root.bringForwards(ids);

            return { root };
        });
    }

    public sendToBack(ids: string[]) {
        return this.mutate(ids, ({ root }) => {
            root = root.sendToBack(ids);

            return { root };
        });
    }

    public sendBackwards(ids: string[]) {
        return this.mutate(ids, ({ root }) => {
            root = root.sendBackwards(ids);

            return { root };
        });
    }

    public updateItem(id: string, updater: (value: DiagramItem) => DiagramItem) {
        return this.mutate([id], ({ items }) => {
            items = items.update(id, updater);

            return { items };
        });
    }

    public group(groupId: string, ids: string[]) {
        return this.mutate(ids, ({ root, items }) => {
            root = root.add(groupId).remove(...ids);

            items = items.set(groupId, DiagramItem.createGroup(groupId, ids));

            return { items, root };
        });
    }

    public ungroup(groupId: string) {
        return this.mutate([groupId], ({ root, items }) => {
            root = root.add(...items.get(groupId).childIds.values).remove(groupId);

            items = items.remove(groupId);

            return { items, root };
        });
    }

    public addItems(set: DiagramItemSet): Diagram {
        if (!set.canAdd(this)) {
            return this;
        }

        return this.mutate([], ({ root, items }) => {
            items = items.mutate(m => {
                for (let item of set.allItems) {
                    m.set(item.id, item);
                }
            });

            root = root.add(...set.rootIds);

            return { items, root };
        });
    }

    public removeItems(set: DiagramItemSet): Diagram {
        if (!set.canRemove(this)) {
            return this;
        }

        return this.mutate([], ({ root, items, selectedIds }) => {
            items = items.mutate(m => {
                for (let id of set.allIds) {
                    m.remove(id);
                }
            });

            selectedIds = selectedIds.mutate(m => {
                for (let id of set.allIds) {
                    m.remove(id);
                }
            });

            root = root.remove(...set.rootIds);

            return { items, root, selectedIds };
        });
    }

    private mutate(itemIds: string[], updater: (diagram: Props) => Partial<Props>): Diagram {
        const items = this.findItems(itemIds);

        if (!items) {
            return this;
        }

        const parent = this.parent(items[0]);

        const root =
            parent ?
            parent.childIds :
            this.root;

        const update = updater({ root, items: this.items, selectedIds: this.selectedIds, id: this.id });

        if (update.root && parent) {
            update.items = update.items || this.items;
            update.items = update.items.update(parent.id, p => p.set('childIds', update.root));

            delete update.root;
        }

        return this.merge(update);
    }

    private findItems(itemIds: string[]): DiagramItem[] | null {
        if (!itemIds) {
            return null;
        }

        const result: DiagramItem[] = [];

        let firstParent = this.parent(itemIds[0]);

        for (let itemId of itemIds) {
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