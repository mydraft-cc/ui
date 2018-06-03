import { Collections } from '@app/core/utils/collections';

export class ImmutableList<T> {
    private static readonly EMPTY = new ImmutableList<any>([]);

    public get size(): number {
        return this.items.length;
    }

    public get first(): T {
        return this.items[0];
    }

    public get last(): T {
        return this.items[this.items.length - 1];
    }

    private constructor(
        private readonly items: T[]
    ) {
        Object.freeze(this);
    }

    public static empty<V>(): ImmutableList<V> {
        return ImmutableList.EMPTY;
    }

    public static of<V>(...items: V[]): ImmutableList<V> {
        if (!items || items.length === 0) {
            return ImmutableList.EMPTY;
        } else {
            return new ImmutableList<V>([...items]);
        }
    }

    public get(index: number): T | undefined {
        return this.items[index];
    }

    public toArray(): T[] {
        return [...this.items];
    }

    public map<R>(projection: (item: T) => R): R[] {
        return this.items.map(v => projection(v!));
    }

    public filter(projection: (item: T) => boolean): T[] {
        return this.items.filter(v => projection(v!));
    }

    public forEach(projection: (item: T) => void): void {
        this.items.forEach(v => projection(v!));
    }

    public add(...items: T[]): ImmutableList<T> {
        return this.replace(Collections.withAdded(this.items, items));
    }

    public remove(...items: T[]): ImmutableList<T> {
        return this.replace(Collections.withRemoved(this.items, items));
    }

    public update(item: T, updater: (item: T) => T): ImmutableList<T> {
        return this.replace(Collections.withUpdated(this.items, [item], updater));
    }

    public bringToFront(items: T[]): ImmutableList<T> {
        return this.moveTo(items, Number.MAX_VALUE);
    }

    public bringForwards(items: T[]): ImmutableList<T> {
        return this.moveTo(items, 1, true);
    }

    public sendBackwards(items: T[]): ImmutableList<T> {
        return this.moveTo(items, -1, true);
    }

    public sendToBack(items: T[]): ImmutableList<T> {
        return this.moveTo(items, 0);
    }

    public moveTo(items: T[], target: number, relative = false): ImmutableList<T> {
        return this.replace(Collections.withMovedTo(this.items, items, target, relative));
    }

    private replace(items: T[]): ImmutableList<T>  {
        if (items === this.items) {
            return this;
        } else {
            return new ImmutableList(items);
        }
    }
}