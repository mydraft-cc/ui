import {
    ImmutableList,
    MathHelper,
    Rotation
} from '@app/core'

import {
    Diagram,
    DiagramContainer,
    DiagramItemSet,
    DiagramShape,
    Transform
} from '@app/wireframes/model';

export class DiagramGroup extends DiagramContainer {
    private adornerBoundsValue: Transform;
    private adornerBoundsDiagram: Diagram;

    constructor(id: string, childIds: ImmutableList<string>,
        public rotation: Rotation
    ) {
        super(id, childIds);
    }

    public static createGroup(childIds: string[], id?: string): DiagramGroup {
        return new DiagramGroup(id || MathHelper.guid(), ImmutableList.of(...childIds), Rotation.ZERO);
    }

    public bounds(diagram: Diagram): Transform {
        if (this.adornerBoundsDiagram !== diagram) {
            const set = DiagramItemSet.createFromDiagram([this.id], diagram);

            if (!set || set.allItems.length === 0) {
                return Transform.ZERO;
            }

            const shapes = set.allVisuals.filter(i => i instanceof DiagramShape).map(i => <DiagramShape>i);

            this.adornerBoundsValue = Transform.createFromTransformationsAndRotations(shapes.map(s => s.transform), this.rotation);
            this.adornerBoundsDiagram = diagram;
        }

        return this.adornerBoundsValue;
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