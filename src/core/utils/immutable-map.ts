/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Types } from './types';

type Mutator<V> = {
    remove: (key: string) => void;

    set: (key: string, value: V) => void;

    update: (key: string, updater: (value: V) => V) => void;
};

export class ImmutableMap<V> {
    private static readonly EMPTY = new ImmutableMap<any>(new Map());

    public get size() {
        return this.items.size;
    }

    public get keys(): ReadonlyArray<string> {
        return Array.from(this.items.keys());
    }

    public get values(): ReadonlyArray<V> {
        return Array.from(this.items.values());
    }

    public get entries(): ReadonlyArray<readonly [string, V]> {
        return Array.from(this.items.entries());
    }

    public get(key: string): V | undefined {
        return this.items.get(key);
    }

    public has(key: string) {
        return this.items.has(key);
    }

    private constructor(
        private readonly items: Map<string, V>,
    ) {
        Object.freeze(this);
        Object.freeze(items);
    }

    public static empty<V>(): ImmutableMap<V> {
        return ImmutableMap.EMPTY;
    }

    public static of<V>(items: { [key: string]: V } | ImmutableMap<V> | undefined) {
        if (!items) {
            return ImmutableMap.EMPTY;
        } else if (items instanceof ImmutableMap) {
            return items;
        } else if (Object.keys(items).length === 0) {
            return ImmutableMap.EMPTY;
        } else {
            return new ImmutableMap<V>(new Map(Object.entries(items)));
        }
    }

    public update(key: string, updater: (value: V) => V) {
        if (!this.has(key)) {
            return this;
        }

        return this.set(key, updater(this.get(key)!));
    }

    public updateAll(updater: (value: V) => V) {
        if (this.size === 0) {
            return this;
        }
        
        let updatedItems: Map<string, V> | undefined = undefined;

        for (const [key, current] of this.items) {
            const newValue = updater(current);

            if (Types.equals(current, newValue)) {
                continue;
            }

            updatedItems ||= new Map(this.items);
            updatedItems.set(key, newValue);
        }

        if (!updatedItems) {
            return this;
        }

        return new ImmutableMap<V>(updatedItems);
    }

    public set(key: string, value: V) {
        if (!key) {
            return this;
        }

        const current = this.items.get(key);

        if (Types.equals(current, value)) {
            return this;
        }

        const items = new Map(this.items);

        items.set(key, value);

        return new ImmutableMap<V>(items);
    }

    public remove(key: string) {
        if (!key || !this.has(key)) {
            return this;
        }

        const items = new Map(this.items);

        items.delete(key);

        return new ImmutableMap<V>(items);
    }

    public mutate(updater: (mutator: Mutator<V>) => void): ImmutableMap<V> {
        let updatedItems: Map<string, V> | undefined = undefined;
        let updateCount = 0;

        const mutator: Mutator<V> = {
            set: (k, v) => {
                if (k) {
                    updatedItems ||= new Map(this.items);

                    const current = updatedItems.get(k);

                    if (!Types.equals(current, v)) {
                        updateCount++;
                        updatedItems.set(k, v);
                    }
                }
            },
            remove: (k) => {
                if (k) {
                    updatedItems ||= new Map(this.items);

                    if (updatedItems.delete(k)) {
                        updateCount++;
                    }
                }
            },
            update: (k, updater: (value: V) => V) => {
                if (k) {
                    updatedItems ||= new Map(this.items);

                    const current = updatedItems.get(k);

                    if (current) {
                        const updated = updater(current);
                        
                        if (!Types.equals(current, updated)) {
                            updateCount++;
                            updatedItems.set(k, updated);
                        }
                    }
                }
            },
        };

        updater(mutator);

        if (!updateCount || !updatedItems) {
            return this;
        }

        return new ImmutableMap(updatedItems);
    }

    public equals(other: ImmutableMap<V>) {
        if (!other) {
            return false;
        }

        return Types.equalsMap(this.items, other.items);
    }
}