/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

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
        public readonly allVisuals: DiagramItem[],
    ) {
        this.allItems.push(...allGroups);
        this.allItems.push(...allVisuals);

        const parents: { [id: string]: boolean } = {};

        for (const group of this.allGroups) {
            for (const childId of group.childIds.values) {
                if (!this.allItems.find(i => i.id === childId) || parents[childId]) {
                    this.isValid = false;
                }

                parents[childId] = true;
            }
        }

        for (const item of this.allItems) {
            if (!parents[item.id]) {
                this.rootItems.push(item);
            }
        }

        Object.freeze(this);
    }

    public static createFromDiagram(items: ReadonlyArray<string | DiagramItem>, diagram: Diagram): DiagramItemSet {
        const allGroups: DiagramItem[] = [];
        const allVisuals: DiagramItem[] = [];

        let flatItemsArray: (itemsOrIds: ReadonlyArray<string | DiagramItem>, isTopLevel: boolean) => void;

        // eslint-disable-next-line prefer-const
        flatItemsArray = (itemsOrIds: ReadonlyArray<string | DiagramItem>) => {
            for (const itemOrId of itemsOrIds) {
                let item: DiagramItem;

                if (Types.isString(itemOrId)) {
                    item = diagram.items.get(itemOrId);
                } else {
                    item = itemOrId;
                }

                if (!item) {
                    // eslint-disable-next-line no-continue
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

        for (const item of this.allItems) {
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

        for (const item of this.allItems) {
            if (!diagram.items.has(item.id)) {
                return false;
            }
        }

        return true;
    }
}
