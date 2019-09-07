import { Map, Record, Set } from 'immutable';

import { DiagramContainer } from './diagram-container';
import { DiagramItem } from './diagram-item';
import { DiagramItemSet } from './diagram-item-set';

type DiagramProps = {
    // The unique id of the diagram.
    id?: string;

    // The list of items.
    items: Map<string, DiagramItem>;

    // The selected ids.
    selectedIds: Set<string>;

    // The root ids.
    root: DiagramContainer;
};

export class Diagram extends Record<DiagramProps>({ items: Map<string, DiagramItem>(), selectedIds: Set<string>(), root: new DiagramContainer() }) {
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

    public parent(id: string) {
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

    public selectItems(itemIds: string[]) {
        const items = this.findItems(itemIds);

        if (!items) {
            return this;
        }

        return this.set('selectedIds', Set<string>(itemIds));
    }

    public addVisual(visual: DiagramItem) {
        const items = this.items.set(visual.id, visual);

        let root = this.root;

        if (items !== this.items) {
            root = root.push(visual.id);
        }

        return this.withMutations(m => m.set('items', items).set('root', root));
    }

    public bringToFront(ids: string[]) {
        if (!this.findItems(ids)) {
            return this;
        }

        return this.set('root', this.root.bringToFront(ids));
    }

    public bringForwards(ids: string[]) {
        if (!this.findItems(ids)) {
            return this;
        }

        return this.set('root', this.root.bringForwards(ids));
    }

    public sendToBack(ids: string[]) {
        if (!this.findItems(ids)) {
            return this;
        }

        return this.set('root', this.root.sendToBack(ids));
    }

    public sendBackwards(ids: string[]) {
        if (!this.findItems(ids)) {
            return this;
        }

        return this.set('root', this.root.sendBackwards(ids));
    }

    public updateItem(id: string, updater: (value: DiagramItem) => DiagramItem) {
        return this.set('items', this.items.update(id, updater));
    }

    public group(groupId: string, ids: string[]) {
        if (!this.findItems(ids)) {
            return this;
        }

        const group = DiagramItem.createGroup(groupId, ids);

        return this.withMutations(m => m.set('items', this.items.set(groupId, group)).set('root', this.root.push(group.id).remove(...ids)));
    }

    public ungroup(groupId: string) {
        const group = this.items.get(groupId);

        if (!group) {
            return this;
        }

        return this.withMutations(m => m.set('items', this.items.remove(group.id)).set('root', this.root.push(...group.childIds.values)));
    }

    public addItems(set: DiagramItemSet): Diagram {
        if (!set || !set.canAdd(this)) {
            return this;
        }

        const items = this.items.withMutations(m => {
            for (let item of set.allItems) {
                m.set(item.id, item);
            }
        });

        const root = this.root.push(...set.rootIds);

        return this.withMutations(m => m.set('items', items).set('root', root));
    }

    public removeItems(set: DiagramItemSet): Diagram {
        if (!set || !set.canRemove(this)) {
            return this;
        }

        const items = this.items.withMutations(m => {
            for (let id of set.allIds) {
                m.remove(id);
            }
        });

        const root = this.root.remove(...set.allIds);

        return this.withMutations(m => m.set('items', items).set('root', root));
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