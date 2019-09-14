import { moveItems } from './collections';

import { equalsArray } from './types';

export class ImmutableList<T> {
    private static readonly EMPTY = new ImmutableList<any>([]);

    public get size() {
        return this.items.length;
    }

    public get values() {
        return this.items;
    }

    public at(index: number): T | undefined {
        return this.items[index];
    }

    constructor(
        private readonly items: T[]
    ) {
        Object.freeze(this);
        Object.freeze(items);
    }

    public static empty<V>(): ImmutableList<V> {
        return ImmutableList.EMPTY;
    }

    public static of<V>(...items: V[]) {
        if (!items || items.length === 0) {
            return ImmutableList.EMPTY;
        } else {
            return new ImmutableList<V>([...items]);
        }
    }

    public add(...items: T[]) {
        if (!items || items.length === 0) {
            return this;
        }

        const newItems = [...this.items, ...items];

        return this.replace(newItems);
    }

    public remove(...items: T[]) {
        if (!items || items.length === 0) {
            return this;
        }

        const newItems: T[] = [...this.items];

        for (let item of items) {
            const index = newItems.indexOf(item);

            if (index < 0) {
                return this;
            }

            newItems.splice(index, 1);
        }

        return this.replace(newItems);
    }

    public bringToFront(items: T[]) {
        return this.moveTo(items, Number.MAX_VALUE);
    }

    public bringForwards(items: T[]) {
        return this.moveTo(items, 1, true);
    }

    public sendBackwards(items: T[]) {
        return this.moveTo(items, -1, true);
    }

    public sendToBack(items: T[]) {
        return this.moveTo(items, 0);
    }

    public moveTo(items: T[], target: number, relative = false) {
        return this.replace(moveItems(this.items, items, target, relative));
    }

    private replace(items: T[]): this {
        if (items === this.items) {
            return this;
        } else {
            const newValue = Object.create(Object.getPrototypeOf(this));

            newValue.items = items;

            return newValue;
        }
    }

    public equals(other: ImmutableList<T>) {
        if (!other) {
            return false;
        }

        return equalsArray(this.items, other.items);
    }
}