export class ImmutableSet {
    private static readonly EMPTY = new ImmutableSet({});
    private readonly items: { [item: string]: boolean };

    public get size(): number {
        return Object.keys(this.items).length;
    }

    private constructor(items: { [item: string]: boolean }) {
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

            return new ImmutableSet(itemMap);
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
        return this.set([item]);
    }

    public remove(...items: string[]): ImmutableSet {
        if (!items) {
            return this;
        }

        const newItems = {...this.items};
        let hasChanged = false;

        for (let item of items) {
            if (item) {
                delete newItems[item];

                hasChanged = true;
            }
        }

        return hasChanged ? new ImmutableSet(newItems) : this;
    }

    public set(items: string[]): ImmutableSet {
        if (!items) {
            return this;
        }

        const newItems = {...this.items};
        let hasChanged = false;

        for (let item of items) {
            if (item) {
                newItems[item] = true;

                hasChanged = true;
            }
        }

        return hasChanged ? new ImmutableSet(newItems) : this;
    }
}