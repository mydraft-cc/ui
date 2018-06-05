import {
    ImmutableList,
    Rotation,
    Types
} from '@app/core';

import {
    Diagram,
    DiagramContainer,
    DiagramItemSet,
    DiagramShape,
    Transform
} from '@app/wireframes/model';

export class DiagramGroup extends DiagramContainer {
    private readonly cachedBounds: { [id: string]: Transform } = {};

    private constructor(id: string, childIds: ImmutableList<string>,
        public rotation: Rotation
    ) {
        super(id, childIds);
    }

    public static createGroup(id: string, childIds: ImmutableList<string> | string[], rotation?: Rotation): DiagramGroup {
        let result: DiagramGroup;

        if (Types.isArrayOfString(childIds)) {
            result = new DiagramGroup(id, ImmutableList.of(...childIds), rotation || Rotation.ZERO);
        } else {
            result = new DiagramGroup(id, childIds, Rotation.ZERO);
        }

        Object.freeze(result);

        return result;
    }

    public bounds(diagram: Diagram): Transform {
        if (!this.cachedBounds[diagram.id]) {
            const set = DiagramItemSet.createFromDiagram([this.id], diagram);

            if (!set || set.allItems.length === 0) {
                return Transform.ZERO;
            }

            const shapes = set.allVisuals.filter(i => i instanceof DiagramShape).map(i => <DiagramShape>i);

            this.cachedBounds[diagram.id] = Transform.createFromTransformationsAndRotations(shapes.map(s => s.transform), this.rotation);
        }

        return this.cachedBounds[diagram.id];
    }

    public transformByBounds(oldBounds: Transform, newBounds: Transform): DiagramGroup {
        if (!oldBounds || !newBounds || newBounds.eq(oldBounds)) {
            return this;
        }

        const newRotation = this.rotation.add(newBounds.rotation).sub(oldBounds.rotation);

        return this.cloned<DiagramGroup>((state: DiagramGroup) => state.rotation = newRotation);
    }

    public clone(): DiagramGroup {
        return new DiagramGroup(
            this.id,
            this.childIds,
            this.rotation);
    }
}