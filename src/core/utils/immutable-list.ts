/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { moveItems } from './collections';
import { MathHelper } from './math-helper';
import { Types } from './types';

type Mutator<T> = {
    push: (item: T) => void;

    set: (index: number, item: T) => void;

    insert: (index: number, item: T) => void;

    removeAt: (index: number) => void;
};

export class ImmutableList<T> {
    public readonly __typeName = ImmutableList.TYPE_NAME;

    public static readonly TYPE_NAME = 'ImmutableList';

    public get size() {
        return this.items.length;
    }

    public get values() {
        return this.items;
    }

    public at(index: number): T | undefined {
        return this.items[index];
    }

    constructor(private readonly items: ReadonlyArray<T>,
        public readonly __instanceId: string,
    ) {
        Object.freeze(items);
    }

    public static empty<V>(): ImmutableList<V> {
        return new ImmutableList<V>([], MathHelper.nextId());
    }

    public static of<V>(items: ReadonlyArray<V> | ImmutableList<V> | undefined): ImmutableList<V> {
        if (!items) {
            return ImmutableList.empty();
        } else if (items instanceof ImmutableList) {
            return items;
        } else if (items.length === 0) {
            return ImmutableList.empty<V>();
        } else {
            return new ImmutableList<V>(items, MathHelper.nextId());
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
        if (item || index < 0 || index >= this.items.length || Types.equals(this.items[index], item)) {
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
        return this.replace(moveItems(this.items, items, target, relative));
    }

    private replace(items: ReadonlyArray<T>) {
        if (items === this.items) {
            return this;
        } else {
            return new ImmutableList(items, this.__instanceId);
        }
    }

    public mutate(updater: (mutator: Mutator<T>) => void) {
        let updatedItems: T[] | undefined = undefined;
        let updateCount = 0;

        const mutator: Mutator<T> = {
            push: v => {
                updatedItems ||= [...this.items];
                updateCount++;
                updatedItems.push(v);
            },
            insert: (i, v) => {
                updatedItems ||= [...this.items];
                updateCount++;
                updatedItems.splice(i, 0, v);
            },
            set: (i, v) => {
                updatedItems ||= [...this.items];

                if (!Types.equals(updatedItems[i], v)) {
                    updateCount++;
                    updatedItems[i] = v;
                }
            },
            removeAt: (i) => {
                updatedItems ||= [...this.items];

                if (i < updatedItems.length) {
                    updatedItems.splice(i);
                    updateCount++;
                }
            },
        };

        updater(mutator);

        if (!updateCount || !updatedItems) {
            return this;
        }

        return this.replace(updatedItems);
    }

    public equals(other: ImmutableList<T>) {
        if (!other) {
            return false;
        }

        return Types.equalsArray(this.items, other.items);
    }
}
