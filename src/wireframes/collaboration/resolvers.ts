/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ArrayDiff, ArrayTypeResolver, ObjectDiff, ObjectTypeResolver, SourceArray, SourceObject, SyncOptions } from 'yjs-redux';
import { Color, ImmutableList, ImmutableMap, Record, Rotation, Vec2 } from '@app/core/utils';
import { Diagram, DiagramItem, EditorState, PluginRegistry, Transform } from '@app/wireframes/model';

// Only the listed properties are synchronized; the selection, the selected page and render caches stay local.

type PropertyConverter = {
    // Converts the property value to an immutable plain value that can be stored in yjs.
    toYjs: (value: any) => unknown;

    // Converts the stored value back.
    fromYjs: (value: any) => unknown;
};

// Primitive values and types with their own resolver (ImmutableMap, ImmutableList, records) are passed through.
type PropertySpec = 'value' | PropertyConverter;

// Returns the same converted value for the same source value, so that unchanged properties produce no updates.
function cachedConverter<T extends object>(toYjs: (value: T) => unknown, fromYjs: (value: any) => T): PropertyConverter {
    const cache = new WeakMap<T, unknown>();

    return {
        toYjs: (value: T) => {
            let result = cache.get(value);

            if (result === undefined) {
                result = Object.freeze(toYjs(value));
                cache.set(value, result);
            }

            return result;
        },
        fromYjs,
    };
}

const COLOR: PropertyConverter = {
    toYjs: (value: Color) => value.toNumber(),
    fromYjs: (value: number) => Color.fromNumber(value),
};

const ROTATION: PropertyConverter = {
    toYjs: (value: Rotation) => value.degree,
    fromYjs: (value: number) => Rotation.fromDegree(value),
};

const TRANSFORM = cachedConverter<Transform>(
    value => value.toJS(),
    value => Transform.fromJS(value));

const VEC2 = cachedConverter<Vec2>(
    value => ({ x: value.x, y: value.y }),
    value => new Vec2(value.x, value.y));

class RecordResolver<T extends Record<any>> implements ObjectTypeResolver<T> {
    private readonly cache = new WeakMap<T, SourceObject>();

    public readonly sourceType = 'Object';

    constructor(
        private readonly properties: { [key: string]: PropertySpec },
        private readonly factory: (values: { [key: string]: any }) => T,
    ) {
    }

    public create(source: SourceObject): T {
        const values: { [key: string]: any } = {};

        for (const [key, value] of Object.entries(source)) {
            if (this.properties[key]) {
                values[key] = this.fromYjs(key, value);
            }
        }

        return this.factory(values);
    }

    public syncToYjs(value: T): SourceObject {
        let result = this.cache.get(value);

        if (!result) {
            const values: { [key: string]: unknown } = {};

            for (const [key, spec] of Object.entries(this.properties)) {
                const propertyValue = (value as Record<any>).get(key);

                if (propertyValue === undefined || propertyValue === null) {
                    continue;
                }

                values[key] = spec === 'value' ? propertyValue : spec.toYjs(propertyValue);
            }

            result = values;

            this.cache.set(value, result);
        }

        return result;
    }

    public syncToObject(existing: T, diffs: ObjectDiff[]): T {
        const merge: { [key: string]: any } = {};

        for (const diff of diffs) {
            if (!this.properties[diff.key]) {
                continue;
            }

            if (diff.type === 'Remove') {
                merge[diff.key] = undefined;
            } else {
                merge[diff.key] = this.fromYjs(diff.key, diff.value);
            }
        }

        return existing.merge(merge);
    }

    private fromYjs(key: string, value: unknown) {
        const spec = this.properties[key];

        if (spec === 'value' || value === undefined || value === null) {
            return value;
        }

        return spec.fromYjs(value);
    }
}

export class ImmutableListResolver implements ArrayTypeResolver<ImmutableList<unknown>> {
    public readonly sourceType = 'Array';

    public create(source: SourceArray): ImmutableList<unknown> {
        return ImmutableList.of([...source]);
    }

    public syncToYjs(value: ImmutableList<unknown>): SourceArray {
        return value.values;
    }

    public syncToObject(existing: ImmutableList<unknown>, diffs: ArrayDiff[]): ImmutableList<unknown> {
        const items = [...existing.values];

        // The indexes of the diffs refer to the already updated array.
        for (const diff of diffs) {
            if (diff.type === 'Delete') {
                items.splice(diff.index, 1);
            } else if (diff.type === 'Insert') {
                items.splice(diff.index, 0, diff.value);
            } else {
                items[diff.index] = diff.value;
            }
        }

        return new ImmutableList(items, existing.__instanceId);
    }
}

export class ImmutableMapResolver implements ObjectTypeResolver<ImmutableMap<unknown>> {
    private readonly cache = new WeakMap<ImmutableMap<unknown>, SourceObject>();

    public readonly sourceType = 'Object';

    public create(source: SourceObject): ImmutableMap<unknown> {
        return ImmutableMap.of({ ...source });
    }

    public syncToYjs(value: ImmutableMap<unknown>): SourceObject {
        let result = this.cache.get(value);

        if (!result) {
            result = Object.fromEntries(value.entries);

            this.cache.set(value, result);
        }

        return result;
    }

    public syncToObject(existing: ImmutableMap<unknown>, diffs: ObjectDiff[]): ImmutableMap<unknown> {
        return existing.mutate(mutator => {
            for (const diff of diffs) {
                if (diff.type === 'Remove') {
                    mutator.remove(diff.key);
                } else {
                    mutator.set(diff.key, diff.value);
                }
            }
        });
    }
}

const EDITOR_RESOLVER = new RecordResolver<EditorState>({
    color: COLOR,
    diagramIds: 'value',
    diagrams: 'value',
    id: 'value',
    size: VEC2,
}, values => EditorState.create(values));

const DIAGRAM_RESOLVER = new RecordResolver<Diagram>({
    id: 'value',
    items: 'value',
    master: 'value',
    rootIds: 'value',
    title: 'value',
}, values => Diagram.create(values));

const DIAGRAM_ITEM_RESOLVER = new RecordResolver<DiagramItem>({
    appearance: 'value',
    childIds: 'value',
    id: 'value',
    isLocked: 'value',
    name: 'value',
    renderer: 'value',
    rotation: ROTATION,
    transform: TRANSFORM,
    type: 'value',
}, createDiagramItem);

function createDiagramItem(values: { [key: string]: any }) {
    if (values.type === 'Group') {
        return DiagramItem.createGroup(values);
    }

    // The configurables and constraints are not synchronized and are therefore taken from the renderer.
    const defaults = PluginRegistry.get(values.renderer)?.createDefaultShape();

    return DiagramItem.createShape({ ...defaults, ...values } as any);
}

export function createSyncOptions(): Partial<SyncOptions> {
    return {
        typeResolvers: {
            [Diagram.TYPE_NAME]: DIAGRAM_RESOLVER,
            [DiagramItem.TYPE_NAME]: DIAGRAM_ITEM_RESOLVER,
            [EditorState.TYPE_NAME]: EDITOR_RESOLVER,
            [ImmutableList.TYPE_NAME]: new ImmutableListResolver(),
            [ImmutableMap.TYPE_NAME]: new ImmutableMapResolver(),
        },
        syncAlways: false,
    };
}
