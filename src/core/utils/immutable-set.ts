import { equalsObject, without } from './types';

type Mutator = {
    add: (item: string) => void,

    remove: (item: string) => void
};

export class ImmutableSet {
    private static readonly EMPTY = new ImmutableSet({});

    public get size() {
        return Object.keys(this.items).length;
    }

    public get values() {
        return Object.keys(this.items);
    }

    public has(item: string) {
        return this.items.hasOwnProperty(item);
    }

    private constructor(
        private readonly items: { [item: string]: boolean }
    ) {
        Object.freeze(this);
        Object.freeze(items);
    }

    public static empty(): ImmutableSet {
        return ImmutableSet.EMPTY;
    }

    public static of(...items: string[]): ImmutableSet {
        if (!items || items.length === 0) {
            return ImmutableSet.EMPTY;
        } else {
            const itemMap = {};

            for (let item of items) {
                itemMap[item] = true;
            }

            return new ImmutableSet(itemMap);
        }
    }

    public add(item: string): ImmutableSet {
        if (!item || this.has(item)) {
            return this;
        }

        const items = { ...this.items, [item]: true };

        return new ImmutableSet(items);
    }

    public remove(item: string): ImmutableSet {
        if (!item || !this.has(item)) {
            return this;
        }

        const items = without(this.items, item);

        return new ImmutableSet(items);
    }

    public mutate(updater: (mutator: Mutator) => void) {
        const items = { ...this.items };

        let updated = false;

        updater({
            add: (k) => {
                if (k) {
                    if (!items.hasOwnProperty(k)) {
                        updated = true;

                        items[k] = true;
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

        return new ImmutableSet(items);
    }

    public equals(other: ImmutableSet) {
        if (!other) {
            return false;
        }

        return equalsObject(this.items, other.items);
    }
}