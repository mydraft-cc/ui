/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Types } from '@app/core/utils';
import { Diagram } from './diagram';
import { DiagramItem } from './diagram-item';

export class DiagramItemSet {
    private cachedSelectedItems?: ReadonlyArray<DiagramItem>;
    private cachedDeepEditableItems?: ReadonlyArray<DiagramItem>;

    public static EMPTY = new DiagramItemSet(new Map(), new Map());

    public readonly rootIds: string[] = [];
    public readonly isComplete: boolean = true;

    public get selectedItems() {
        return this.cachedSelectedItems ||= Array.from(this.selection.values()).filter(x => !x.isLocked);
    }

    public get deepEditableItems() {
        return this.cachedDeepEditableItems ||= Array.from(this.nested.values()).filter(x => !this.selection.has(x.id) || !x.isLocked);
    }

    constructor(
        public readonly nested: Map<string, DiagramItem>,
        public readonly selection: Map<string, DiagramItem>,
    ) {
        const parents: { [id: string]: boolean } = {};

        for (const item of nested.values()) {
            if (item.type !== 'Group') {
                continue;
            }

            for (const childId of item.childIds.values) {
                if (!nested.get(childId) || parents[childId]) {
                    this.isComplete = false;
                }

                parents[childId] = true;
            }
        }

        for (const item of nested.values()) {
            if (!parents[item.id]) {
                this.rootIds.push(item.id);
            }
        }
    }

    public static createFromDiagram(items: ReadonlyArray<string | DiagramItem>, diagram: Diagram): DiagramItemSet {
        const allItems = new Map<string, DiagramItem>();
        const allSources = new Map<string, DiagramItem>();

        flattenRootItems(items, diagram, allItems, allSources);

        return new DiagramItemSet(allItems, allSources);
    }

    public canAdd(diagram: Diagram): boolean {
        if (!this.isComplete) {
            return false;
        }

        for (const item of this.nested.values()) {
            if (diagram.items.has(item.id)) {
                return false;
            }
        }

        return true;
    }

    public canRemove(diagram: Diagram): boolean {
        if (!this.isComplete) {
            return false;
        }

        for (const item of this.nested.values()) {
            if (!diagram.items.has(item.id)) {
                return false;
            }
        }

        return true;
    }
}

type OrderedItems = { item: DiagramItem; orderIndex: number }[];

function flattenRootItems(items: ReadonlyArray<string | DiagramItem>, diagram: Diagram, allItems: Map<string, DiagramItem>, source: Map<string, DiagramItem>) {
    const byRoot: OrderedItems = [];
    const byParents = new Map<string, OrderedItems>();

    for (const itemOrId of items) {
        let item = itemOrId;

        if (Types.isString(itemOrId)) {
            item = diagram.items.get(itemOrId)!;
        } else {
            item = itemOrId;
        }

        if (!item) {
            continue;
        }

        const parent = diagram.parent(item);

        if (parent) {
            let byParent = byParents.get(parent.id);

            if (!byParent) {
                byParent = [];
                byParents.set(parent.id, byParent);
            }

            const orderIndex = parent.childIds.indexOf(item.id);

            byParent.push({ orderIndex, item });                
        } else {
            const orderIndex = diagram.rootIds.indexOf(item.id);

            byRoot.push({ orderIndex, item });   
        }

        source.set(item.id, item);
    }

    unrollParent(byRoot, diagram, allItems);

    for (const byParent of byParents.values()) {        
        unrollParent(byParent, diagram, allItems);
    }
}

function unrollParent(byParent: OrderedItems, diagram: Diagram, allItems: Map<string, DiagramItem>) {
    if (byParent.length === 0) {
        return;
    }

    byParent.sort((a, b) => a.orderIndex - b.orderIndex);

    for (const { item } of byParent) {
        allItems.set(item.id, item);

        if (item.type === 'Group') {
            unrollItems(item.childIds.values, diagram, allItems);
        }
    }
}

function unrollItems(source: ReadonlyArray<string>, diagram: Diagram, allItems: Map<string, DiagramItem>) {
    for (const itemOrId of source) {
        let item = diagram.items.get(itemOrId);

        if (!item) {
            continue;
        }

        allItems.set(item.id, item);

        if (item.type === 'Group') {
            unrollItems(item.childIds.values, diagram, allItems);
        }
    }
}