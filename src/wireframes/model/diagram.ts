import {
    ImmutableIdMap,
    ImmutableList,
    ImmutableSet,
    MathHelper
} from '@app/core';

import {
    DiagramContainer,
    DiagramGroup,
    DiagramItem,
    DiagramItemSet,
    DiagramVisual
} from '@app/wireframes/model';

export class Diagram {
    public get rootIds(): ImmutableList<string> {
        return this.roots.childIds;
    }

    constructor(
        public readonly id: string,
        public readonly items: ImmutableIdMap<DiagramItem>,
        public readonly roots: DiagramContainer,
        public readonly selectedItemIds: ImmutableSet,
        private readonly parents: { [id: string]: DiagramGroup }
    ) {
        Object.freeze(this);
    }

    public static empty(id?: string): Diagram {
        return new Diagram(id || MathHelper.guid(), ImmutableIdMap.empty<DiagramItem>(), DiagramContainer.createContainer(), ImmutableSet.empty(), {});
    }

    public parent(id: string): DiagramGroup | null {
        return id ? this.parents[id] : null;
    }

    public updateItem(itemId: string, updater: (value: DiagramItem) => DiagramItem): Diagram {
        return this.cloned(this.items.update(itemId, updater), this.roots);
    }

    public selectItems(itemIds: string[]): Diagram {
        const items = this.findItems(itemIds);

        if (!items) {
            return this;
        }

        return this.cloned(this.items, this.roots, this.selectedItemIds.set(...itemIds));
    }

    public addVisual(visual: DiagramVisual): Diagram {
        const newItems = this.items.add(visual);

        let newChildIds = this.roots;

        if (newItems !== this.items) {
            newChildIds = newChildIds.addItems(visual.id);
        }

        return this.cloned(newItems, newChildIds);
    }

    public bringToFront(itemIds: string[]): Diagram {
        return this.withMutations(itemIds, (_, u) => u(c => c.bringToFront(itemIds)));
    }

    public bringForwards(itemIds: string[]): Diagram {
        return this.withMutations(itemIds, (_, u) => u(c => c.bringForwards(itemIds)));
    }

    public sendToBack(itemIds: string[]): Diagram {
        return this.withMutations(itemIds, (_, u) => u(c => c.sendToBack(itemIds)));
    }

    public sendBackwards(itemIds: string[]): Diagram {
        return this.withMutations(itemIds, (_, u) => u(c => c.sendBackwards(itemIds)));
    }

    public group(itemIds: string[], groupId?: string): Diagram {
        return this.withMutations(itemIds, (m, u) => {
            const group = DiagramGroup.createGroup(itemIds, groupId);

            u(c => c.removeItems(...itemIds).addItems(group.id));

            m.items = m.items.add(group);
        });
    }

    public ungroup(groupId: string): Diagram {
        return this.withMutations([groupId], (m, u) => {
            const group = <DiagramGroup>this.items.get(groupId);

            u(c => c.removeItems(group.id).addItems(...group.childIds.toArray()));

            m.items = m.items.remove(groupId);
        });
    }

    public addItems(set: DiagramItemSet): Diagram {
        if (!set || !set.canAdd(this)) {
            return this;
        }

        return this.cloned(this.items.add(...set.allItems), this.roots.addItems(...set.rootIds));
    }

    public removeItems(set: DiagramItemSet): Diagram {
        if (!set || !set.canRemove(this)) {
            return this;
        }

        const allIds = set.allItems.map(i => i.id);

        return this.cloned(this.items.remove(...allIds), this.roots.removeItems(...set.rootIds), this.selectedItemIds.remove(...allIds));
    }

    private withMutations(itemIds: string[], mutator: (mutable: MutableDiagram, updater: (m: (container: DiagramContainer) => DiagramContainer) => void) => void): Diagram {
        const items = this.findItems(itemIds);

        if (!items) {
            return this;
        }

        let oldParent = this.parent(items[0].id) || this.roots;
        let newParent = oldParent;

        const state: MutableDiagram = { items: this.items, roots: this.roots, selectedItemIds: this.selectedItemIds };

        const updater: (m: (container: DiagramContainer) => DiagramContainer) => void = m => {
            newParent = m(oldParent);

            if (oldParent === state.roots) {
                state.roots = newParent;
            } else {
                state.items = state.items.update(oldParent.id, c => newParent);
            }

            oldParent = newParent;
        };

        mutator(state, updater);

        return this.cloned(state.items, state.roots, state.selectedItemIds);
    }

    private findItems(itemIds: string[]): DiagramItem[] | null {
        if (!itemIds) {
            return null;
        }

        const result: DiagramItem[] = [];

        let firstParent = <DiagramContainer>this.parent(itemIds[0]);

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

    private cloned(items: ImmutableIdMap<DiagramItem>, roots: DiagramContainer, selectedItemIds?: ImmutableSet): Diagram {
        selectedItemIds = selectedItemIds || this.selectedItemIds;

        if (items !== this.items || selectedItemIds !== this.selectedItemIds || this.roots !== roots) {
            const parents: { [id: string]: DiagramGroup } = {};

            items.forEach(group => {
                if (group instanceof DiagramGroup) {
                    group.childIds.forEach(id => {
                        parents[id] = <DiagramGroup>group;
                    });
                }
            });

            return new Diagram(this.id, items, roots, selectedItemIds, parents);
        } else {
            return this;
        }
    }
}

interface MutableDiagram {
    items: ImmutableIdMap<DiagramItem>; roots: DiagramContainer; selectedItemIds: ImmutableSet;
}