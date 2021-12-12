/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ImmutableMap } from './immutable-map';
import { Types } from './types';

export abstract class Record<T> {
    private readonly values: ImmutableMap<any>;

    public get<K extends keyof T>(key: K): T[K] {
        return this.values.get(key as string);
    }

    constructor(values: T) {
        this.values = ImmutableMap.of(values as any);
        this.values = this.afterClone(this.values);
    }

    public set<K extends keyof T>(key: K, value: T[K]): this {
        const values = this.values.set(key as string, value);

        return this.makeRecord(values);
    }

    public merge(props: Partial<T>) {
        const values = this.values.mutate(m => {
            for (const [key, value] of Object.entries(props)) {
                m.set(key, value);
            }
        });

        return this.makeRecord(values);
    }

    private makeRecord(values: ImmutableMap<any>) {
        if (Types.equals(values, this.values)) {
            return this;
        }

        const record = Object.create(Object.getPrototypeOf(this));

        record.values = values;
        record.values = record.afterClone(values, this);

        return record;
    }

    protected afterClone(values: ImmutableMap<any>) {
        return values;
    }
}
