export class ImmutableSet {
    private static readonly EMPTY = new ImmutableSet({}, 0);
    private readonly items: { [item: string]: boolean };

    private constructor(items: { [item: string]: boolean }, public readonly size: number) {
        this.items = items;
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

            return new ImmutableSet(itemMap, Object.keys(itemMap).length);
        }
    }

    public contains(item: string): boolean {
        return this.items[item];
    }

    public toArray(): string[] {
        return Object.keys(this.items);
    }

    public map<R>(projection: (item: string) => R): R[] {
        return Object.keys(this.items).map(v => projection(v!));
    }

    public filter(projection: (item: string) => boolean): string[] {
        return Object.keys(this.items).filter(v => projection(v!));
    }

    public forEach(projection: (item: string) => void): void {
        Object.keys(this.items).forEach(v => projection(v!));
    }

    public add(item: string): ImmutableSet {
        if (!item || this.items[item]) {
            return this;
        }

        const newItems = {...this.items};

        newItems[item] = true;

        return new ImmutableSet(newItems, this.size + 1);
    }

    public remove(...items: string[]): ImmutableSet {
        if (!items) {
            return this;
        }

        const newItems = {...this.items};

        for (let item of items) {
            if (!item || !this.items[item]) {
                return this;
            }

            delete newItems[item];
        }

        return new ImmutableSet(newItems, this.size - items.length);
    }

    public set(...items: string[]): ImmutableSet {
        if (!items) {
            return this;
        }

        const newItems = {};

        for (let item of items) {
            if (!item) {
                return this;
            }

            newItems[item] = true;
        }

        const newSize = Object.keys(newItems).length;

        if (newSize !== this.size) {
            return new ImmutableSet(newItems, newSize);
        }

        for (let item of items) {
            if (!this.items[item]) {
                return new ImmutableSet(newItems, newSize);
            }
        }

        return this;
    }
}