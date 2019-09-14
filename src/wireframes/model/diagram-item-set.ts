import { Types } from '@app/core';

import { Diagram } from './diagram';
import { DiagramItem } from './diagram-item';

export class DiagramItemSet {
    public readonly rootItems: DiagramItem[] = [];
    public readonly allItems: DiagramItem[] = [];

    public isValid = true;

    public get rootIds(): string[] {
        return this.rootItems.map(i => i.id);
    }

    public get allIds(): string[] {
        return this.allItems.map(i => i.id);
    }

    constructor(
        public readonly allGroups: DiagramItem[],
        public readonly allVisuals: DiagramItem[]
    ) {
        this.allItems.push(...allGroups);
        this.allItems.push(...allVisuals);

        const parents: { [id: string]: boolean } = {};

        for (let group of this.allGroups) {
            for (let childId of group.childIds.values) {
                if (!this.allItems.find(i => i.id === childId) || parents[childId]) {
                    this.isValid = false;
                }

                parents[childId] = true;
            }
        }

        for (let item of this.allItems) {
            if (!parents[item.id]) {
                this.rootItems.push(item);
            }
        }

        Object.freeze(this);
    }

    public static createFromDiagram(items: (string | DiagramItem)[], diagram: Diagram): DiagramItemSet {
        const allGroups: DiagramItem[] = [];
        const allVisuals: DiagramItem[] = [];

        let flatItemsArray: (itemsOrIds: (string | DiagramItem)[], isTopLevel: boolean) => void;

        flatItemsArray = (itemsOrIds: (string | DiagramItem)[]) => {
            for (let itemOrId of itemsOrIds) {
                let item: DiagramItem;

                if (Types.isString(itemOrId)) {
                    item = diagram.items.get(itemOrId);
                } else {
                    item = itemOrId;
                }

                if (!item) {
                    continue;
                }

                if (item.type === 'Group') {
                    allGroups.push(item);

                    flatItemsArray(item.childIds.values, false);
                } else {
                    allVisuals.push(item);
                }
            }
        };

        if (items) {
            flatItemsArray(items, true);
        }

        return new DiagramItemSet(allGroups, allVisuals);
    }

    public canAdd(diagram: Diagram): boolean {
        if (!this.isValid) {
            return false;
        }

        for (let item of this.allItems) {
            if (diagram.items.has(item.id)) {
                return false;
            }
        }

        return true;
    }

    public canRemove(diagram: Diagram): boolean {
        if (!this.isValid) {
            return false;
        }

        for (let item of this.allItems) {
            if (!diagram.items.has(item.id)) {
                return false;
            }
        }

        return true;
    }
}