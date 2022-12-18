/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Types } from './types';

export abstract class Record<T> {
    private readonly values: {};

    public get<K extends keyof T>(key: K): T[K] {
        return this.values[key as string];
    }

    constructor(values: T) {
        this.values = values;
        this.values = this.afterClone(this.values);

        Object.freeze(values);
    }

    public set<K extends keyof T>(key: K, value: T[K]): this {
        const values = { ...this.values, [key]: value };

        return this.makeRecord(values);
    }

    public merge(props: Partial<T>) {
        const values = { ...this.values, ...props };

        return this.makeRecord(values);
    }

    private makeRecord(values: object) {
        if (Types.equals(values, this.values)) {
            return this;
        }

        const record = Object.create(Object.getPrototypeOf(this));

        record.values = values;
        record.values = record.afterClone(values, this);

        Object.freeze(record.value);

        return record;
    }

    protected afterClone(values: object) {
        return values;
    }
}
