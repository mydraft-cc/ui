import { ImmutableMap } from './immutable-map';

import { equals } from './types';

export abstract class Record<T> {
    private readonly values: ImmutableMap<any>;

    public get<K extends keyof T>(key: K): T[K] {
        return this.values.get(key as string);
    }

    constructor(values?: Partial<T>) {
        this.values = ImmutableMap.of(values as any);
    }

    public set<K extends keyof T>(key: K, value: T[K]): this {
        const values = this.values.set(key as string, value);

        return this.makeRecord(values);
    }

    public merge(props: Partial<T>) {
        const values = this.values.mutate(m => {
            for (let key in props) {
                if (props.hasOwnProperty(key)) {
                    m.set(key, props[key]);
                }
            }
        });

        return this.makeRecord(values);
    }

    private makeRecord(values: ImmutableMap<any>) {
        if (equals(values, this.values)) {
            return this;
        }

        const record = Object.create(Object.getPrototypeOf(this));

        record.values = values;

        return record;
    }
}