import { equals, equalsObject, without } from './types';

type Mutator<T> = {
    remove: (key: string) => void,

    set: (key: string, value: T) => void
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

    public toJS() {
        return this.items;
    }

    public get(key: string): T | undefined {
        return this.items[key];
    }

    public has(key: string) {
        return key && this.items.hasOwnProperty(key);
    }

    private constructor(
        private readonly items: { [key: string]: T }
    ) {
        Object.freeze(this);
        Object.freeze(items);
    }

    public static empty<V>(): ImmutableMap<V> {
        return ImmutableMap.EMPTY;
    }

    public static of<V>(items: { [key: string]: V }) {
        if (!items || Object.keys(items).length === 0) {
            return ImmutableMap.EMPTY;
        } else {
            return new ImmutableMap<V>(items);
        }
    }

    public update(key: string, updater: (value: T) => T) {
        if (!this.has(key)) {
            return this;
        }

        return this.set(key, updater(this.get(key)));
    }

    public set(key: string, value: T) {
        if (!key) {
            return this;
        }

        const current = this.items[key];

        if (equals(current, value)) {
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

        updater({
            set: (k, v) => {
                if (k) {
                    const current = this.items[k];

                    if (!equals(current, v)) {
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
            }
        });

        if (!updated) {
            return this;
        }

        return new ImmutableMap(items);
    }

    public equals(other: ImmutableMap<T>) {
        if (!other) {
            return false;
        }

        return equalsObject(this.items, other.items);
    }
}