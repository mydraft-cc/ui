/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ImmutableList } from './immutable-list';
import { Types, without } from './types';

type Mutator<T> = {
    remove: (key: string) => void;

    set: (key: string, value: T) => void;

    update: (key: string, updater: (value: T) => T) => void;
};

export class ImmutableMap<T> {
    private static readonly EMPTY = new ImmutableMap<any>([]);

    public get size() {
        return Object.keys(this.items).length;
    }

    public get keys() {
        return Object.keys(this.items);
    }

    public get values() {
        return this.keys.map(k => this.items[k]);
    }

    public get raw() {
        return this.items;
    }

    public get(key: string): T | undefined {
        return this.items[key];
    }

    public has(key: string) {
        return key && this.items.hasOwnProperty(key);
    }

    private constructor(
        private readonly items: { [key: string]: T },
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
            return new ImmutableMap<V>(items);
        }
    }

    public static create<V>(items: ReadonlyArray<V> | ImmutableList<V> | undefined, selector: (source: V) => string): ImmutableMap<V> {
        if (!items) {
            return ImmutableMap.EMPTY;
        } else if (Types.isArray(items)) {
            return new ImmutableMap<V>(buildObject(items, selector));
        } else if (Object.keys(items).length === 0) {
            return ImmutableMap.EMPTY;
        } else {
            return new ImmutableMap<V>(buildObject(items.raw, selector));
        }
    }

    public update(key: string, updater: (value: T) => T) {
        if (!this.has(key)) {
            return this;
        }

        return this.set(key, updater(this.get(key)!));
    }

    public set(key: string, value: T) {
        if (!key) {
            return this;
        }

        const current = this.items[key];

        if (Types.equals(current, value)) {
            return this;
        }

        const items = { ...this.items, [key]: value };

        return new ImmutableMap<T>(items);
    }

    public remove(key: string) {
        if (!key || !this.has(key)) {
            return this;
        }

        const items = without(this.items, key);

        return new ImmutableMap<T>(items);
    }

    public mutate(updater: (mutator: Mutator<T>) => void) {
        const items = { ...this.items };

        let updated = false;

        const mutator: Mutator<T> = {
            set: (k, v) => {
                if (k) {
                    const current = this.items[k];

                    if (!Types.equals(current, v)) {
                        updated = true;

                        items[k] = v;
                    }
                }
            },
            remove: (k) => {
                if (k) {
                    if (items.hasOwnProperty(k)) {
                        updated = true;

                        delete items[k];
                    }
                }
            },
            update: (k, updater: (value: T) => T) => {
                if (k) {
                    if (items.hasOwnProperty(k)) {
                        mutator.set(k, updater(items[k]));
                    }
                }
            },
        };

        updater(mutator);

        if (!updated) {
            return this;
        }

        return new ImmutableMap(items);
    }

    public equals(other: ImmutableMap<T>) {
        if (!other) {
            return false;
        }

        return Types.equalsObject(this.items, other.items);
    }
}

function buildObject<V>(source: ReadonlyArray<V>, selector: (source: V) => string) {
    const result: { [key: string]: V } = {};

    for (const item of source) {
        result[selector(item)] = item;
    }

    return result;
}