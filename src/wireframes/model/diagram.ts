import { Map, Record, Set } from 'immutable';

import { Types, updateWhenFound } from '@app/core';

import { DiagramContainer } from './diagram-container';
import { DiagramItem } from './diagram-item';
import { DiagramItemSet } from './diagram-item-set';

type Props = {
    // The unique id of the diagram.
    id: string;

    // The list of items.
    items: Map<string, DiagramItem>;

    // The selected ids.
    selectedIds: Set<string>;

    // The root ids.
    root: DiagramContainer;
};

export class Diagram extends Record<Props>({ id: '0', items: Map(), selectedIds: Set(), root: new DiagramContainer() }) {
    private parents: { [id: string]: DiagramItem };

    public get rootIds() {
        return this.get('root').ids;
    }

    public get rootItems() {
        return this.get('root').ids.map(x => this.items.get(x)).filter(x => !!x).toArray();
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

            this.items.forEach((item) => {
                if (item.type === 'Group') {
                    item.childIds.ids.forEach(childId => {
                        this.parents[childId] = item;
                    });
                }
            });
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
                root = root.push(visual.id);
            }

            return { items, root };
        });
    }

    public selectItems(ids: string[]) {
        return this.mutate(ids, () => {
            const selectedIds = Set(ids);

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
            items = updateWhenFound(items, id, updater);

            return { items };
        });
    }

    public group(groupId: string, ids: string[]) {
        return this.mutate(ids, ({ root, items }) => {
            root = root.push(groupId).remove(...ids);

            items = items.set(groupId, DiagramItem.createGroup(groupId, ids));

            return { items, root };
        });
    }

    public ungroup(groupId: string) {
        return this.mutate([groupId], ({ root, items }) => {
            root = root.push(...items.get(groupId).childIds.toArray()).remove(groupId);

            items = items.remove(groupId);

            return { items, root };
        });
    }

    public addItems(set: DiagramItemSet): Diagram {
        if (!set.canAdd(this)) {
            return this;
        }

        return this.mutate([], ({ root, items }) => {
            items = items.withMutations(m => {
                for (let item of set.allItems) {
                    m.set(item.id, item);
                }
            });

            root = root.push(...set.rootIds);

            return { items, root };
        });
    }

    public removeItems(set: DiagramItemSet): Diagram {
        if (!set.canRemove(this)) {
            return this;
        }

        return this.mutate([], ({ root, items, selectedIds }) => {
            items = items.withMutations(m => {
                for (let id of set.allIds) {
                    m.remove(id);
                }
            });

            selectedIds = selectedIds.withMutations(m => {
                for (let id of set.allIds) {
                    m.remove(id);
                }
            });

            root = root.remove(...set.rootIds);

            return { items, root };
        });
    }

    private mutate(itemIds: string[], updater: (diagram: Props) => Partial<Props>): Diagram {
        const items = this.findItems(itemIds);

        if (!items) {
            return this;
        }

        return this.withMutations(m => {
            const parent = this.parent(items[0]);

            const root =
                parent ?
                parent.childIds :
                this.root;

            const update = updater({ root, items: this.items, selectedIds: this.selectedIds, id: this.id });

            if (update.items) {
                m.set('items', update.items);
            }

            if (update.selectedIds) {
                m.set('selectedIds', update.selectedIds);
            }

            if (update.root) {
                if (parent) {
                    m.set('items', updateWhenFound(m.items, parent.id, p => p.set('childIds', update.root)));
                } else {
                    m.set('root', update.root);
                }
            }
        });
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