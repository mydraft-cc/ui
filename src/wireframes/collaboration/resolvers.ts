/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ArrayDiff, ArrayTypeResolver, ObjectDiff, ObjectTypeResolver, SourceArray, SourceObject, ValueResolver } from 'yjs-redux';
import { Color, ImmutableList, ImmutableMap, Record, Rect2, Rotation, Vec2 } from '@app/core';
import { MinSizeConstraint, SizeConstraint, TextHeightConstraint, Transform } from '@app/wireframes/model';

class DelegateValueResolver<T> implements ValueResolver<T> {
    constructor(
        public readonly fromYjs: (Source: SourceObject) => T,
        public readonly fromValue: (Source: T) => SourceObject,
    ) {
    }
}

export const COLOR_RESOLVER =
    new DelegateValueResolver(Color.fromJS, s => s.toJS());

export const MINSIZE_CONSTRAINT_RESOLVER =
    new DelegateValueResolver(() => new MinSizeConstraint(), () => ({}));

export const RECT2_RESOLVER =
    new DelegateValueResolver(Rect2.fromJS, s => s.toJS());

export const ROTATION_RESOLVER =
    new DelegateValueResolver(Rotation.fromJS, s => s.toJS());

export const SIZE_CONSTRAINT_RESOLVER =
    new DelegateValueResolver(s => new SizeConstraint(s.w as number, s.h as number),  s => ({ w: s.width, h: s.height }));

export const TEXTHEIGHT_CONSTRAINT_RESOLVER =
    new DelegateValueResolver(s => new TextHeightConstraint(s.p as number),  s => ({ p: s.padding }));

export const TRANSFORM_RESOLVER =
    new DelegateValueResolver(Transform.fromJS, s => s.toJS());

export const VEC2_RESOLVER =
    new DelegateValueResolver(Vec2.fromJS, s => s.toJS());

export class ImmutableListResolver implements ArrayTypeResolver<ImmutableList<unknown>> {
    public readonly sourceType = 'Array';

    public create(source: SourceArray): ImmutableList<unknown> {
        return ImmutableList.of(source as any);
    }

    public syncToYjs(value: ImmutableList<unknown>): SourceArray {
        return value.values;
    }

    public syncToObject(existing: ImmutableList<unknown>, diffs: ArrayDiff[]): ImmutableList<unknown> {
        return existing.mutate(mutator => {
            for (const diff of diffs) {
                if (diff.type === 'Delete') {
                    mutator.removeAt(diff.index);
                } else {
                    mutator.insert(diff.index, diff.value);
                }
            }
        });
    }
}

export class ImmutableMapResolver implements ObjectTypeResolver<ImmutableMap<unknown>> {
    public readonly sourceType = 'Object';

    public create(source: SourceObject): ImmutableMap<unknown> {
        return ImmutableMap.of(source as any);
    }

    public syncToYjs(value: ImmutableMap<unknown>): SourceObject {
        return value.raw;
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

export class RecordResolver<T extends Record<any>> implements ObjectTypeResolver<T> {
    public readonly sourceType = 'Object';

    public constructor(
        private readonly factory: (source: any) => T,
    ) {
    }

    public create(source: SourceObject): T {
        return this.factory(source);
    }

    public syncToYjs(value: T): SourceObject {
        return value.raw;
    }

    public syncToObject(existing: T, diffs: ObjectDiff[]): T {
        const merge: { [key: string ]: any } = {};

        for (const diff of diffs) {
            if (diff.type === 'Remove') {
                merge[diff.key] = undefined;
            } else {
                merge[diff.key] = diff.value;
            }
        }
        
        return existing.merge(merge);
    }
}