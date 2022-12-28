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
    public readonly rootIds: string[] = [];

    public isValid = true;

    constructor(source: DiagramItem[]) {
        const parents: { [id: string]: boolean } = {};

        for (const item of source) {
            this.allItems.push(item);

            if (item.type !== 'Group') {
                this.allShapes.push(item);
            } else {
                this.allGroups.push(item);
                
                for (const childId of item.childIds.values) {
                    if (!source.find(i => i.id === childId) || parents[childId]) {
                        this.isValid = false;
                    }
    
                    parents[childId] = true;
                }

            }
        }

        for (const item of source) {
            if (!parents[item.id]) {
                this.rootIds.push(item.id);
            }
        }

        Object.freeze(this);
    }

    public static createFromDiagram(items: ReadonlyArray<string | DiagramItem>, diagram: Diagram): DiagramItemSet {
        const allItems: DiagramItem[] = [];

        flattenRootItems(items, diagram, allItems);

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

type OrderedItems = { item: DiagramItem; orderIndex: number }[];

function flattenRootItems(source: ReadonlyArray<string | DiagramItem>, diagram: Diagram, allItems: DiagramItem[]) {
    const byRoot: OrderedItems = [];
    const byParents: { [id: string]: OrderedItems } = {};

    for (const itemOrId of source) {
        let item = itemOrId;

        if (Types.isString(itemOrId)) {
            item = diagram.items.get(itemOrId)!;
        } else {
            item = itemOrId;
        }

        if (item) {
            const parent = diagram.parent(item);

            if (parent) {
                let byParent = byParents[parent.id];
    
                if (!byParent) {
                    byParent = [];
                    byParents[parent.id] = byParent;
                }

                const orderIndex = parent.childIds.values.indexOf(item.id);

                byParent.push({ orderIndex, item });                
            } else {
                const orderIndex = diagram.rootIds.values.indexOf(item.id);

                byRoot.push({ orderIndex, item });   
            }
        }
    }

    function handleParent(byParent: OrderedItems, diagram: Diagram, allItems: DiagramItem[]) {
        if (byParent.length === 0) {
            return;
        }

        byParent.sort((a, b) => a.orderIndex - b.orderIndex);

        for (const { item } of byParent) {
            allItems.push(item);

            if (item.type === 'Group') {
                flattenItems(item.childIds.values, diagram, allItems);
            }
        }
    }

    handleParent(byRoot, diagram, allItems);

    for (const byParent of Object.values(byParents)) {        
        handleParent(byParent, diagram, allItems);
    }
}

function flattenItems(source: ReadonlyArray<string>, diagram: Diagram, allItems: DiagramItem[]) {
    for (const itemOrId of source) {
        let item = diagram.items.get(itemOrId);

        if (!item) {
            continue;
        }

        allItems.push(item);

        if (item.type === 'Group') {
            flattenItems(item.childIds.values, diagram, allItems);
        }
    }
}