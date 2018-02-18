import { ImmutableObject } from '@app/core'

import { Diagram, Transform } from '@app/wireframes/model';

export abstract class DiagramItem extends ImmutableObject {
    constructor(public id: string) {
        super();
    }

    public abstract bounds(diagram: Diagram): Transform;

    public abstract transformByBounds(oldBounds: Transform, newBounds: Transform): DiagramItem;
}