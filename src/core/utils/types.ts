export module Types {
    export function hash(value: any): string {
        try {
            return JSON.stringify(value);
        } catch (e) {
            return '';
        }
    }

    export function isString(value: any): value is string {
        return typeof value === 'string' || value instanceof String;
    }

    export function isNumber(value: any): value is number {
        return typeof value === 'number' && isFinite(value);
    }

    export function isBoolean(value: any): value is boolean {
        return typeof value === 'boolean';
    }

    export function isUndefined(value: any): value is undefined {
        return typeof value === 'undefined';
    }

    export function isFunction(value: any): value is Function {
        return value && typeof value === 'function';
    }

    export function isObject(value: any): value is Object {
        return value && typeof value === 'object' && value.constructor === Object;
    }

    export function isRegExp(value: any): value is RegExp {
        return value && typeof value === 'object' && value.constructor === RegExp;
    }

    export function isNull(value: any): value is null {
        return value === null;
    }

    export function isDate(value: any): value is Date {
        return value instanceof Date;
    }

    export function is<TClass>(value: any, c: new (...args: any[]) => TClass): value is TClass {
        return value instanceof c;
    }

    export function isArray(value: any): value is Array<any> {
        return Array.isArray(value);
    }

    export function isArrayOfNumber(value: any): value is Array<number> {
        return isArrayOf(value, v => isNumber(v));
    }

    export function isArrayOfString(value: any): value is Array<string> {
        return isArrayOf(value, v => isString(v));
    }

    export function isArrayOf(value: any, validator: (v: any) => boolean): boolean {
        if (!Array.isArray(value)) {
            return false;
        }

        for (let v of value) {
            if (!validator(v)) {
                return false;
            }
        }

        return true;
    }

    export function jsJsonEquals<T>(lhs: T, rhs: T) {
        return hash(lhs) === hash(rhs);
    }
}

export function without<T>(obj: { [key: string]: T }, key: string) {
    const copy = { ...obj };

    delete copy[key];

    return copy;
}

export function equals(lhs: any, rhs: any) {
    if (lhs === rhs || (lhs !== lhs && rhs !== rhs)) {
        return true;
    }

    if (!lhs || !rhs) {
        return false;
    }

    return !!(isValueObject(lhs) && isValueObject(rhs) && lhs.equals(rhs));
}

export function equalsObject(lhs: { [key: string]: any }, rhs: { [key: string]: any }) {
    if (equals(lhs, rhs)) {
        return true;
    }

    if (Object.keys(lhs).length !== Object.keys(rhs).length) {
        return false;
    }

    for (let key in lhs) {
        if (lhs.hasOwnProperty(key)) {
            if (!equals(lhs[key], rhs[key])) {
                return false;
            }
        }
    }

    return true;
}

export function equalsArray(lhs: any[], rhs: any[]) {
    if (equals(lhs, rhs)) {
        return true;
    }

    if (lhs.length !== rhs.length) {
        return false;
    }

    for (let i = 0; i < lhs.length; i++) {
        if (!equals(lhs[i], rhs[i])) {
            return false;
        }
    }

    return true;
}

export function isValueObject(value: any) {
    return value && Types.isFunction(value.equals);
}