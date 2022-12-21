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
    public readonly allItems: DiagramItem[] = [];
    public readonly allShapes: DiagramItem[] = [];
    public readonly allGroups: DiagramItem[] = [];
    public readonly itemIds: string[] = [];

    public isValid = true;

    constructor(source: DiagramItem[]) {
        const parents: { [id: string]: boolean } = {};

        for (const item of source) {
            this.allItems.push(item);

            if (item.type !== 'Group') {
                this.allShapes.push(item);
            } else {
                this.allGroups.push(item);
                
                for (const childId of item.childIds.raw) {
                    if (!source.find(i => i.id === childId) || parents[childId]) {
                        this.isValid = false;
                    }
    
                    parents[childId] = true;
                }

            }
        }

        for (const item of source) {
            if (!parents[item.id]) {
                this.itemIds.push(item.id);
            }
        }

        Object.freeze(this);
    }

    public static createFromDiagram(items: ReadonlyArray<string | DiagramItem>, diagram: Diagram): DiagramItemSet {
        const allItems: DiagramItem[] = [];

        flattenItems(items, diagram, allItems);

        return new DiagramItemSet(allItems);
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

function flattenItems(source: ReadonlyArray<string | DiagramItem>, diagram: Diagram, allItems: DiagramItem[]) {
    for (const itemOrId of source) {
        let item = itemOrId;

        if (Types.isString(itemOrId)) {
            item = diagram.items.get(itemOrId)!;
        } else {
            item = itemOrId;
        }

        if (item) {
            allItems.push(item);
        }

        if (item?.type === 'Group') {
            flattenItems(item.childIds.raw, diagram, allItems);
        }
    }
}