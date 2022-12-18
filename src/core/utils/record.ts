/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Types } from './types';

export abstract class Record<T extends object> {
    private readonly values: T;

    public get<K extends keyof T>(key: K): T[K] {
        return this.values[key as string];
    }

    constructor(values: T) {
        this.values = values;
        this.values = this.afterClone(this.values);

        Object.freeze(values);
    }

    public set<K extends keyof T>(key: K, value: T[K]): this {
        const values = { ...this.values };

        if (Types.isUndefined(value)) {
            delete values[key];
        } else {
            values[key] = value;
        }

        return this.makeRecord(values);
    }

    public merge(props: Partial<T>) {
        const values = { ...this.values };

        for (const [key, value] of Object.entries(props)) {
            if (Types.isUndefined(value)) {
                delete values[key];
            } else {
                values[key] = value;
            }
        }

        return this.makeRecord(values);
    }

    private makeRecord(values: T) {
        if (Types.equals(values, this.values)) {
            return this;
        }

        const record = Object.create(Object.getPrototypeOf(this));

        record.values = values;
        record.values = record.afterClone(values, this);

        Object.freeze(record.value);

        return record;
    }

    protected afterClone(values: T) {
        return values;
    }
}
