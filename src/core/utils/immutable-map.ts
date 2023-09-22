/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper } from './math-helper';
import { Types, without } from './types';

type Mutator<T> = {
    remove: (key: string) => void;

    set: (key: string, value: T) => void;

    update: (key: string, updater: (value: T) => T) => void;
};

export class ImmutableMap<T> {
    public static readonly TYPE_NAME = 'ImmutableMap';
    
    public readonly __typeName = ImmutableMap.TYPE_NAME;

    public get size() {
        return Object.keys(this.items).length;
    }

    public get keys() {
        return Object.keys(this.items);
    }

    public get values(): ReadonlyArray<T> {
        return Object.values(this.items);
    }

    public get entries() {
        return Object.entries(this.items);
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

    private constructor(private readonly items: { [key: string]: T },
        public readonly __instanceId: string,
    ) {
        Object.freeze(items);
    }

    public static empty<V>(): ImmutableMap<V> {
        return new ImmutableMap({}, MathHelper.nextId());
    }

    public static of<V>(items: { [key: string]: V } | ImmutableMap<V> | undefined): ImmutableMap<V> {
        if (!items) {
            return ImmutableMap.empty();
        } else if (items instanceof ImmutableMap) {
            return items;
        } else if (Object.keys(items).length === 0) {
            return ImmutableMap.empty();
        } else {
            return new ImmutableMap<V>(items, MathHelper.nextId());
        }
    }

    public update(key: string, updater: (value: T) => T) {
        if (!this.has(key)) {
            return this;
        }

        return this.set(key, updater(this.get(key)!));
    }

    public updateAll(updater: (value: T) => T) {
        if (this.size === 0) {
            return this;
        }
        
        let updatedItems: { [key: string]: T } | undefined = undefined;

        for (const [key, current] of Object.entries(this.items)) {
            const newValue = updater(current);

            if (Types.equals(current, newValue)) {
                continue;
            }

            updatedItems ||= { ...this.items };
            updatedItems[key] = newValue;
        }

        if (!updatedItems) {
            return this;
        }

        return new ImmutableMap<T>(updatedItems, this.__instanceId);
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

        return new ImmutableMap<T>(items, this.__instanceId);
    }

    public remove(key: string) {
        if (!key || !this.has(key)) {
            return this;
        }

        const items = without(this.items, key);

        return new ImmutableMap<T>(items, this.__instanceId);
    }

    public mutate(updater: (mutator: Mutator<T>) => void): ImmutableMap<T> {
        let updatedItems: { [key: string]: T } | undefined = undefined;
        let updateCount = 0;

        const mutator: Mutator<T> = {
            set: (k, v) => {
                if (k) {
                    updatedItems ||= { ...this.items };

                    const current = this.items[k];

                    if (!Types.equals(current, v)) {
                        updateCount++;
                        updatedItems[k] = v;
                    }
                }
            },
            remove: (k) => {
                if (k) {
                    updatedItems ||= { ...this.items };

                    if (updatedItems.hasOwnProperty(k)) {
                        updateCount++;

                        delete updatedItems[k];
                    }
                }
            },
            update: (k, updater: (value: T) => T) => {
                if (k) {
                    updatedItems ||= { ...this.items };

                    if (updatedItems.hasOwnProperty(k)) {
                        mutator.set(k, updater(updatedItems[k]));
                    }
                }
            },
        };

        updater(mutator);

        if (!updateCount || !updatedItems) {
            return this;
        }

        return new ImmutableMap(updatedItems, this.__instanceId);
    }

    public equals(other: ImmutableMap<T>) {
        if (!other) {
            return false;
        }

        return Types.equalsObject(this.items, other.items);
    }
}