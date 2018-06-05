import { Collections } from '@app/core/utils/collections';

export interface WithId {
    id: string;
}

export class ImmutableIdMap<T extends WithId> {
    private static readonly EMPTY = new ImmutableIdMap<any>([]);
    private readonly lazy: { itemsById: { [id: string]: T } | null } = { itemsById: null};

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

    public static empty<V extends WithId>(): ImmutableIdMap<V> {
        return ImmutableIdMap.EMPTY;
    }

    public static of<V extends WithId>(...items: V[]): ImmutableIdMap<V> {
        if (!items || items.length === 0) {
            return ImmutableIdMap.EMPTY;
        } else {
            return new ImmutableIdMap<V>([...items]);
        }
    }

    public get(id: string): T | undefined {
        const items = this.ensureItemsById();

        return items[id];
    }

    public contains(id: string): boolean {
        const items = this.ensureItemsById();

        return !!items[id];
    }

    public at(index: number) {
        return this.items[index];
    }

    public toArray(): T[] {
        return [...this.items];
    }

    public map<R>(projection: (item: T, key?: string) => R): R[] {
        return this.items.map((v, k) => projection(v!, v!.id));
    }

    public filter(projection: (item: T, key?: string) => boolean): T[] {
        return this.items.filter((v, k) => projection(v!, v!.id));
    }

    public forEach(projection: (item: T, key?: string) => void): void {
        this.items.forEach((v, k) => projection(v!, v!.id));
    }

    public add(...items: T[]): ImmutableIdMap<T> {
        return this.replace(Collections.withAdded(this.items, items, x => !!x.id && !this.contains(x.id)));
    }

    public remove(...ids: string[]): ImmutableIdMap<T> {
        return this.replace(Collections.withRemoved(this.items, this.getItems(ids)));
    }

    public update(id: string, updater: (item: T) => T): ImmutableIdMap<T> {
        return this.replace(Collections.withUpdated(this.items, this.getItems([id]), updater, (l, r) => l.id === r.id));
    }

    public bringToFront(ids: string[]): ImmutableIdMap<T> {
        return this.moveTo(ids, Number.MAX_VALUE);
    }

    public bringForwards(ids: string[]): ImmutableIdMap<T> {
        return this.moveTo(ids, 1, true);
    }

    public sendBackwards(ids: string[]): ImmutableIdMap<T> {
        return this.moveTo(ids, -1, true);
    }

    public sendToBack(ids: string[]): ImmutableIdMap<T> {
        return this.moveTo(ids, 0);
    }

    public moveTo(ids: string[], target: number, relative = false): ImmutableIdMap<T> {
        return this.replace(Collections.withMovedTo(this.items, this.getItems(ids), target, relative));
    }

    public indexOf(id: string) {
        let result = -1;

        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].id === id) {
                result = i;
                break;
            }
        }

        return result;
    }

    private replace(items: T[]): ImmutableIdMap<T>  {
        if (items === this.items) {
            return this;
        } else {
            return new ImmutableIdMap(items);
        }
    }

    private getItems(ids: string[]): T[] {
        let result: T[] | null = null;

        if (ids) {
            for (let id of ids) {
                const item = this.get(id);

                if (item) {
                    if (result === null) {
                        result = [];
                    }

                    result.push(item);
                }
            }

            if (result && result.length !== ids.length) {
                return null!;
            }
        }

        return result!;
    }

    private ensureItemsById(): { [id: string]: T } {
        if (this.lazy.itemsById === null) {
            this.lazy.itemsById = {};

            this.forEach(item => {
                this.lazy.itemsById![item.id] = item;
            });

            Object.freeze(this.lazy);
            Object.freeze(this.lazy.itemsById);
        }

        return this.lazy.itemsById;
    }
}