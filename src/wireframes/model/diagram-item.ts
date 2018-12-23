import { ImmutableObject } from '@app/core';

import { Diagram } from './diagram';
import { Transform } from './transform';

export abstract class DiagramItem extends ImmutableObject {
    protected constructor(
        public id: string
    ) {
        super();
    }

    public abstract bounds(diagram: Diagram): Transform;

    public abstract transformByBounds(oldBounds: Transform, newBounds: Transform): DiagramItem;
}