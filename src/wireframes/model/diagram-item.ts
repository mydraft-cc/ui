/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ImmutableList, ImmutableMap, MathHelper, Record, Rotation } from '@app/core/utils';
import { DefaultAppearance, Shape } from '@app/wireframes/interface';
import { Configurable } from './configurables';
import { Constraint } from './constraints';
import { Diagram } from './diagram';
import { DiagramItemSet } from './diagram-item-set';
import { Transform } from './transform';

type ItemProps = {
    // The unique id for each item.
    id: string;

    // The locking state.
    isLocked?: boolean;

    // The name of the item.
    name?: string;

    // The type of the item.
    type: 'Shape' | 'Group';
};

type GroupProps = {
    // The child ids.
    childIds: ImmutableList<string>;

    // The cache for child values.
    childCache: object;

    // The rotation.
    rotation: Rotation;
};

type ShapeProps = {
    // The transformation..
    transform: Transform;

    // The configurable properties.
    configurables?: ReadonlyArray<Configurable>;

    // The transform constraints.
    constraint?: Constraint;

    // The id of the renderer.
    renderer: string;

    // Cachhe for the rendering process.
    renderCache: object;

    // The appearance.
    appearance: ImmutableMap<any>;
};

type Props = ItemProps & GroupProps & ShapeProps;


type InitialItemProps = {
    // The unique id for each item.
    id?: string;

    // The locking state.
    isLocked?: boolean;

    // The name of the item.
    name?: string;
};

export type InitialShapeProps = {
    // The transform.
    transform?: Transform;

    // The configurable properties.
    configurables?: ReadonlyArray<Configurable>;

    // The transform constraints.
    constraint?: Constraint;

    // The appearance.
    appearance?: { [key: string]: any } | ImmutableMap<any>;

    // The id of the renderer.
    renderer: string;
} & InitialItemProps;

export type InitialGroupProps = {
    // The transformation..
    childIds?: ReadonlyArray<string> | ImmutableList<string>;

    // The id of the renderer.
    rotation?: Rotation;
} & InitialItemProps;

export class DiagramItem extends Record<Props> implements Shape {
    private cachedBounds: { [id: string]: Transform } | undefined = {};

    public get id() {
        return this.get('id');
    }

    public get type() {
        return this.get('type');
    }

    public get name() {
        return this.get('name');
    }

    public get appearance() {
        return this.get('appearance');
    }

    public get childIds() {
        return this.get('childIds');
    }

    public get configurables() {
        return this.get('configurables');
    }

    public get constraint() {
        return this.get('constraint');
    }

    public get isLocked() {
        return this.get('isLocked');
    }

    public get rotation() {
        return this.get('rotation');
    }

    public get renderCache() {
        return this.get('renderCache');
    }

    public get renderer() {
        return this.get('renderer');
    }

    public get transform() {
        return this.get('transform');
    }

    public get fontSize(): number {
        return this.getAppearance(DefaultAppearance.FONT_SIZE) || 10;
    }

    public get fontFamily(): string {
        return this.getAppearance(DefaultAppearance.FONT_FAMILY) || 'inherit';
    }

    public get backgroundColor(): string {
        return this.getAppearance(DefaultAppearance.BACKGROUND_COLOR);
    }

    public get foregroundColor(): string {
        return this.getAppearance(DefaultAppearance.FOREGROUND_COLOR);
    }

    public get iconFontFamily(): string {
        return this.getAppearance(DefaultAppearance.ICON_FONT_FAMILY);
    }

    public get link(): string {
        return this.getAppearance(DefaultAppearance.LINK);
    }

    public get opacity(): number {
        return this.getAppearance(DefaultAppearance.OPACITY);
    }

    public get strokeColor(): string {
        return this.getAppearance(DefaultAppearance.STROKE_COLOR);
    }

    public get strokeThickness(): number {
        return this.getAppearance(DefaultAppearance.STROKE_THICKNESS);
    }

    public get text(): string {
        return this.getAppearance(DefaultAppearance.TEXT);
    }

    public get textAlignment(): string {
        return this.getAppearance(DefaultAppearance.TEXT_ALIGNMENT);
    }

    public get textDisabled(): boolean {
        return this.getAppearance(DefaultAppearance.TEXT_DISABLED);
    }

    public getAppearance(key: string) {
        return this.appearance.get(key);
    }

    public static createGroup(setup: InitialGroupProps = {}) {
        const { id, childIds, isLocked, name, rotation } = setup;

        const props: GroupProps & ItemProps = {
            id: id || MathHelper.nextId(),
            childCache: {},
            childIds: ImmutableList.of(childIds),
            isLocked,
            name,
            rotation: rotation || Rotation.ZERO,
            type: 'Group',
        };

        return new DiagramItem(props as any);
    }

    public static createShape(setup: InitialShapeProps) {
        const { id, appearance, configurables, constraint, isLocked, name, renderer, transform } = setup;

        const props: ShapeProps & ItemProps = {
            id: id || MathHelper.nextId(),
            appearance: ImmutableMap.of(appearance),
            configurables,
            constraint,
            isLocked,
            name,
            renderCache: {},
            renderer,
            transform: transform || Transform.ZERO,
            type: 'Shape',
        };

        return new DiagramItem(props as any);
    }

    public lock() {
        return this.set('isLocked', true);
    }

    public unlock() {
        return this.set('isLocked', undefined);
    }

    public rename(name: string) {
        return this.set('name', name);
    }

    public replaceAppearance(appearance:ImmutableMap<any>) {
        if (this.type === 'Group' || !appearance) {
            return this;
        }

        return this.set('appearance', appearance);
    }

    public setAppearance(key: string, value: any) {
        if (this.type === 'Group') {
            return this;
        }

        const appearance = this.appearance.set(key, value);

        return this.set('appearance', appearance);
    }

    public transformWith(transformer: (t: Transform) => Transform) {
        if (this.type === 'Group' || !transformer) {
            return this;
        }

        const newTransform = transformer(this.transform);

        if (!newTransform) {
            return this;
        }

        return this.set('transform', newTransform);
    }

    public bounds(diagram: Diagram): Transform {
        if (this.type === 'Group') {
            this.cachedBounds ||= {};
        
            let cacheId = diagram.instanceId;
            let cached = this.cachedBounds[cacheId];

            if (!cached) {
                const allShapes = DiagramItemSet.createFromDiagram([this.id], diagram).nested;

                if (allShapes.size === 0) {
                    return Transform.ZERO;
                }

                const transforms = Array.from(allShapes.values(), x => x.transform).filter(x => !!x);

                this.cachedBounds[cacheId] = cached = Transform.createFromTransformationsAndRotation(transforms, this.rotation);
            }

            return cached;
        } else {
            return this.transform;
        }
    }

    public transformByBounds(oldBounds: Transform, newBounds: Transform) {
        if (!oldBounds || !newBounds || oldBounds.equals(newBounds)) {
            return this;
        }

        if (this.type === 'Group') {
            const rotation = this.rotation.add(newBounds.rotation).sub(oldBounds.rotation);

            return this.set('rotation', rotation);
        } else {
            const transform = this.transform.transformByBounds(oldBounds, newBounds, undefined);

            return this.set('transform', transform);
        }
    }

    protected afterClone(values: Props, prev?: DiagramItem) {
        if (this.constraint) {
            const size = this.constraint.updateSize(this, this.transform.size, prev);

            if (size.x > 0 && size.y > 0) {
                values.transform = this.transform.resizeTopLeft(size);
            }
        }

        return values;
    }
}