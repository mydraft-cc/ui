/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ArrayDiff, ArrayTypeResolver, ObjectDiff, ObjectTypeResolver, SourceArray, SourceObject, ValueResolver } from 'yjs-redux';
import { Color, ImmutableList, ImmutableMap, ImmutableSet, Record, Rect2, Rotation, Vec2 } from '@app/core';
import { MinSizeConstraint, SizeConstraint, TextHeightConstraint, Transform } from '@app/wireframes/model';

export class MinSizeConstraintResolver implements ValueResolver<MinSizeConstraint> {
    public fromYjs(): MinSizeConstraint {
        return new MinSizeConstraint();
    }
    
    public fromValue(): SourceObject {
        return {};
    }
}

export class SizeConstraintResolver implements ValueResolver<SizeConstraint> {
    public fromYjs(source: SourceObject): SizeConstraint {
        return new SizeConstraint(source.width as number, source.height as number);
    }
    
    public fromValue(source: SizeConstraint): SourceObject {
        return { width: source.width, height: source.height };
    }
}

export class TextHeightConstraintResolver implements ValueResolver<TextHeightConstraint> {
    public fromYjs(source: SourceObject): TextHeightConstraint {
        return new TextHeightConstraint(source.padding as number);
    }
    
    public fromValue(source: TextHeightConstraint): SourceObject {
        return { padding: source.padding };
    }
}

export class TransformResolver implements ValueResolver<Transform> {
    public fromYjs(source: SourceObject): Transform {
        return Transform.fromJS(source);
    }
    
    public fromValue(source: Transform): SourceObject {
        return source.toJS();
    }
}

export class ColorResolver implements ValueResolver<Color> {
    public fromYjs(source: SourceObject): Color {
        return new Color(source.r as number, source.g as number, source.b as number);
    }
    
    public fromValue(source: Color): SourceObject {
        return { r: source.r, g: source.g, b: source.b };
    }
}

export class RotationResolver implements ValueResolver<Rotation> {
    public fromYjs(source: SourceObject): Rotation {
        return Rotation.fromDegree(source.degree as number);
    }
    
    public fromValue(source: Rotation): SourceObject {
        return { degree: source.degree };
    }
}

export class Vec2Resolver implements ValueResolver<Vec2> {
    public fromYjs(source: SourceObject): Vec2 {
        return new Vec2(source.x as number, source.y as number);
    }
    
    public fromValue(source: Vec2): SourceObject {
        return { x: source.x, y: source.y };
    }
}

export class Rect2Resolver implements ValueResolver<Rect2> {
    public fromYjs(source: SourceObject): Rect2 {
        return new Rect2(source.x as number, source.y as number, source.w as number, source.h as number);
    }
    
    public fromValue(source: Rect2): SourceObject {
        return { x: source.x, y: source.y, w: source.w, h: source.h };
    }
}

export class ImmutableListResolver implements ArrayTypeResolver<ImmutableList<unknown>> {
    public readonly sourceType = 'Array';

    public create(source: SourceArray): ImmutableList<unknown> {
        return ImmutableList.of(source as any);
    }

    public syncToYjs(value: ImmutableList<unknown>): SourceArray {
        return value.raw;
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

export class ImmutableSetResolver implements ObjectTypeResolver<ImmutableSet> {
    public readonly sourceType = 'Object';

    public create(source: SourceObject): ImmutableSet {
        return ImmutableSet.of(...Object.keys(source));
    }

    public syncToYjs(value: ImmutableSet): SourceObject {
        return value.raw;
    }

    public syncToObject(existing: ImmutableSet, diffs: ObjectDiff[]): ImmutableSet {
        return existing.mutate(mutator => {
            for (const diff of diffs) {
                if (diff.type === 'Remove') {
                    mutator.remove(diff.key);
                } else {
                    mutator.add(diff.key);
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
        const merge: object = {};

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