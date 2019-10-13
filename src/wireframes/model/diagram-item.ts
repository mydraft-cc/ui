import {
    ImmutableMap,
    Record,
    Rotation,
    Types,
    Vec2
} from '@app/core';

import { Configurable } from './configurables';
import { Constraint } from './constraints';
import { Diagram } from './diagram';
import { DiagramContainer } from './diagram-container';
import { DiagramItemSet } from './diagram-item-set';
import { Transform } from './transform';

type Appearance = ImmutableMap<any>;

type ItemProps = {
    // The unique id for each item.
    id: string;

    // The locking state.
    isLocked: boolean;

    // The type of the item.
    type: 'Shape' | 'Group';
};

type VisualProps = {
    // The appearance.
    appearance: Appearance;
};

type GroupProps = {
    // The child ids.
    childIds: DiagramContainer;

    // The rotation.
    rotation: Rotation;
};

type ShapeProps = {
    // The transformation..
    transform: Transform,

    // The configurable properties.
    configurables: Configurable[],

    // The transform constraints.
    constraint?: Constraint;

    // The id of the renderer.
    renderer: string
};

type Props = ItemProps & GroupProps & ShapeProps & VisualProps;

const DEFAULT_APPEARANCE = ImmutableMap.empty();
const DEFAULT_CHILD_IDS = DiagramContainer.default();
const DEFAULT_CONFIGURABLES: Configurable[] = [];

export class DiagramItem extends Record<Props> {
    private cachedBounds: { [id: string]: Transform } | undefined;
    private cachedDiagram: Diagram;

    public static readonly APPEARANCE_BACKGROUND_COLOR = 'FOREGROUND_COLOR';
    public static readonly APPEARANCE_FONT_FAMILY = 'FONT_FAMILY';
    public static readonly APPEARANCE_FONT_SIZE = 'FONT_SIZE';
    public static readonly APPEARANCE_FOREGROUND_COLOR = 'BACKGROUND_COLOR';
    public static readonly APPEARANCE_ICON_FONT_FAMILY = 'ICON_FONT_FAMILY';
    public static readonly APPEARANCE_OPACITY = 'OPACITY';
    public static readonly APPEARANCE_STROKE_COLOR = 'STROKE_COLOR';
    public static readonly APPEARANCE_STROKE_THICKNESS = 'STROKE_THICKNESS';
    public static readonly APPEARANCE_TEXT = 'TEXT';
    public static readonly APPEARANCE_TEXT_ALIGNMENT = 'TEXT_ALIGNMENT';
    public static readonly APPEARANCE_TEXT_DISABLED = 'TEXT_DISABLED';

    public get appearance() {
        return this.get('appearance') || DEFAULT_APPEARANCE;
    }

    public get childIds() {
        return this.get('childIds') || DEFAULT_CHILD_IDS;
    }

    public get configurables() {
        return this.get('configurables') || DEFAULT_CONFIGURABLES;
    }

    public get constraint() {
        return this.get('constraint');
    }

    public get isLocked() {
        return this.get('isLocked') || false;
    }

    public get id() {
        return this.get('id');
    }

    public get rotation() {
        return this.get('rotation') || Rotation.ZERO;
    }

    public get renderer() {
        return this.get('renderer');
    }

    public get transform() {
        return this.get('transform');
    }

    public get type() {
        return this.get('type');
    }

    public static createGroup(id: string, ids: DiagramContainer | string[], rotation?: Rotation) {
        const childIds = getChildIds(ids);

        return new DiagramItem({ id, type: 'Group', isLocked: false, childIds, rotation });
    }

    public static createShape(id: string, renderer: string, w: number, h: number, configurables?: Configurable[], visual?: Appearance | { [key: string]: any }, constraint?: Constraint) {
        const appearance = getAppearance(visual);

        return new DiagramItem({ id, type: 'Shape', isLocked: false, transform: createTransform(w, h), renderer, appearance, configurables, constraint });
    }

    public lock() {
        return this.set('isLocked', true);
    }

    public unlock() {
        return this.set('isLocked', false);
    }

    public replaceAppearance(appearance: Appearance) {
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

    public unsetAppearance(key: string) {
        if (this.type === 'Group') {
            return this;
        }

        const appearance = this.appearance.remove(key);

        return this.set('appearance', appearance);
    }

    public transformWith(transformer: (t: Transform) => Transform) {
        if (this.type === 'Group' || !transformer) {
            return this;
        }

        const newTransform = transformer(this.transform);

        return this.transformTo(newTransform);
    }

    public transformTo(transform: Transform) {
        if (this.type === 'Group' || !transform) {
            return this;
        }

        return this.set('transform', transform);
    }

    public bounds(diagram: Diagram): Transform {
        if (this.type === 'Group') {
            if (!this.cachedBounds || this.cachedDiagram !== diagram) {
                this.cachedBounds = {};
                this.cachedDiagram = diagram;
            }

            if (!this.cachedBounds[diagram.id]) {
                const set = DiagramItemSet.createFromDiagram([this.id], diagram);

                if (!set || set.allItems.length === 0) {
                    return Transform.ZERO;
                }

                const transforms = set.allVisuals.filter(x => x.type === 'Shape').map(x => x.transform);

                this.cachedBounds[diagram.id] = Transform.createFromTransformationsAndRotations(transforms, this.rotation);
            }

            return this.cachedBounds[diagram.id];
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
            const transform = this.transform.transformByBounds(oldBounds, newBounds);

            return this.transformTo(transform);
        }
    }

    protected afterClone(values: ImmutableMap<any>, prev?: DiagramItem) {
        if (this.constraint) {
            const size = this.constraint.updateSize(this, this.transform.size, prev);

            if (size.x > 0 && size.y > 0) {
                return values.set('transform', this.transform.resizeTopLeft(size).round());
            }
        }

        return values;
    }
}

function getAppearance(visual: ImmutableMap<any> | { [key: string]: any; }) {
    if (Types.isObject(visual)) {
        return ImmutableMap.of(<any>visual);
    }

    return visual || DEFAULT_APPEARANCE;
}

function getChildIds(childIds: DiagramContainer | string[] | undefined): DiagramContainer {
    if (Types.isArray(childIds)) {
        return DiagramContainer.of(...childIds);
    }

    return childIds || new DiagramContainer([]);
}

function createTransform(w: number, h: number): Transform {
    return new Transform(Vec2.ZERO, new Vec2(w, h), Rotation.ZERO);
}