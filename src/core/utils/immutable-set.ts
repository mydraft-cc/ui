/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Types } from './types';

type Mutator<V> = {
    add: (item: V) => void;

    remove: (item: V) => void;
};

export class ImmutableSet<V> {
    private static readonly EMPTY = new ImmutableSet(new Set<any>());

    public get size() {
        return this.items.size;
    }

    public get values(): ReadonlyArray<V> {
        return Array.from(this.items.values());
    }

    public has(item: V) {
        return this.items.has(item);
    }

    private constructor(
        private readonly items: Set<V>,
    ) {
        Object.freeze(this);
        Object.freeze(items);
    }

    public static empty<V>(): ImmutableSet<V> {
        return ImmutableSet.EMPTY;
    }

    public static of<V>(...items: V[]): ImmutableSet<V> {
        if (!items || items.length === 0) {
            return ImmutableSet.EMPTY;
        } else {
            return new ImmutableSet(new Set(items));
        }
    }

    public add(item: V): ImmutableSet<V> {
        if (!item || this.has(item)) {
            return this;
        }

        const items = new Set(this.items);

        items.add(item);

        return new ImmutableSet(items);
    }

    public remove(item: V): ImmutableSet<V> {
        if (!item || !this.has(item)) {
            return this;
        }

        const items = new Set(this.items);

        items.delete(item);

        return new ImmutableSet(items);
    }

    public mutate(updater: (mutator: Mutator<V>) => void): ImmutableSet<V> {
        let updatedItems: Set<V> | undefined = undefined;
        let updateCount = 0;

        updater({
            add: (k) => {
                if (k) {
                    updatedItems ||= new Set(this.items);

                    if (!updatedItems.has(k)) {
                        updatedItems.add(k);
                        updateCount++;
                    }
                }
            },
            remove: (k) => {
                if (k) {
                    updatedItems ||= new Set(this.items);

                    if (updatedItems.delete(k)) {
                        updateCount++;
                    }
                }
            },
        });

        if (!updatedItems || updateCount === 0) {
            return this;
        }

        return new ImmutableSet(updatedItems);
    }

    public equals(other: ImmutableSet<V>) {
        if (!other) {
            return false;
        }

        return Types.equalsSet(this.items, other.items);
    }
}
