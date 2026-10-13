/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { moveItems } from './collections';
import { MathHelper } from './math-helper';
import { Types } from './types';

export class ImmutableList<T> {
    public static readonly TYPE_NAME = 'ImmutableList';

    // Stable identity across updates, used to sync with yjs.
    public readonly __instanceId: string;

    public get __typeName() {
        return ImmutableList.TYPE_NAME;
    }

    public get size() {
        return this.items.length;
    }

    public get values(): ReadonlyArray<T> {
        return Array.from(this.items);
    }

    public at(index: number): T | undefined {
        return this.items[index];
    }
    
    public indexOf(item: T) {
        return this.items.indexOf(item);
    }

    constructor(
        private readonly items: ReadonlyArray<T>,
        instanceId?: string,
    ) {
        this.__instanceId = instanceId || MathHelper.nextId();

        Object.freeze(this);
        Object.freeze(items);
    }

    public static empty<V>(): ImmutableList<V> {
        // Do not share instances, because the sync with yjs tracks instances.
        return new ImmutableList<V>([]);
    }

    public static of<V>(items: ReadonlyArray<V> | ImmutableList<V> | undefined) {
        if (!items) {
            return ImmutableList.empty<V>();
        } else if (items instanceof ImmutableList) {
            return items;
        } else {
            return new ImmutableList<V>(items);
        }
    }

    public add(...items: ReadonlyArray<T>) {
        if (!items || items.length === 0) {
            return this;
        }

        const newItems = [...this.items, ...items];

        return this.replace(newItems);
    }

    public remove(...items: ReadonlyArray<T>) {
        if (!items || items.length === 0) {
            return this;
        }

        const newItems: T[] = [...this.items];

        for (const item of items) {
            const index = newItems.indexOf(item);

            if (index < 0) {
                return this;
            }

            newItems.splice(index, 1);
        }

        return this.replace(newItems);
    }

    public set(index: number, item: T) {
        if (item === undefined || item === null || index < 0 || index >= this.items.length || Types.equals(this.items[index], item)) {
            return this;
        }

        const newItems: T[] = [...this.items];

        newItems[index] = item;

        return this.replace(newItems);
    }

    public bringToFront(items: ReadonlyArray<T>) {
        return this.moveTo(items, Number.MAX_VALUE);
    }

    public bringForwards(items: ReadonlyArray<T>) {
        return this.moveTo(items, 1, true);
    }

    public sendBackwards(items: ReadonlyArray<T>) {
        return this.moveTo(items, -1, true);
    }

    public sendToBack(items: ReadonlyArray<T>) {
        return this.moveTo(items, 0);
    }

    public moveTo(items: ReadonlyArray<T>, target: number, relative = false) {
        if (!items) {
            return this;
        }
    
        return this.replace(moveItems(this.items, items, target, relative));
    }

    private replace(items: ReadonlyArray<T>): this {
        if (items === this.items) {
            return this;
        } else {
            const newValue = Object.create(Object.getPrototypeOf(this));

            newValue.items = items;
            newValue.__instanceId = this.__instanceId;

            Object.freeze(newValue);

            return newValue;
        }
    }

    public equals(other: ImmutableList<T>) {
        if (!other) {
            return false;
        }

        return Types.equalsArray(this.items, other.items);
    }
}
