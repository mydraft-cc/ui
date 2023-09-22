/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper } from './math-helper';
import { Types } from './types';

export abstract class Record<T extends object> {
    private readonly values: T;

    public readonly __instanceId: string;

    public get<K extends keyof T>(key: K): T[K] {
        return this.values[key as string];
    }

    public get raw() {
        return this.values;
    }

    constructor(values: T,
        public readonly __typeName: string, id?: string,
    ){
        this.__instanceId = id || (values as any)['__instanceId'] || MathHelper.nextId();
        this.values = values;
        this.values = this.afterClone(this.values);

        Object.freeze(values);
    }

    public set<K extends keyof T>(key: K, value: T[K]): this {
        const current = this.values[key];
    
        if (Types.equals(current, value)) {
            return this;
        }

        const values = { ...this.values };

        if (Types.isUndefined(value)) {
            delete values[key];
        } else {
            values[key] = value;
        }

        return this.makeRecord(values);
    }

    public merge(props: Partial<T>): this {
        const values = { ...this.values };

        let updates = 0;

        for (const [key, value] of Object.entries(props)) {
            const current = this.values[key];
    
            if (Types.equals(current, value)) {
                continue;
            }

            if (Types.isUndefined(value)) {
                delete values[key];
            } else {
                values[key] = value;
            }

            updates++;
        }

        if (updates === 0) {
            return this;
        }

        return this.makeRecord(values);
    }

    private makeRecord(values: T) {
        const record = Object.create(Object.getPrototypeOf(this));

        record.values = values;
        record.values = record.afterClone(values, this);
        record.__instanceId = this.__instanceId;
        record.__typeName = this.__typeName;

        Object.freeze(record.values);

        return record;
    }

    protected afterClone(values: T) {
        return values;
    }

    public unsafeValues() {
        return this.values;
    }
}
