import { ImmutableObject } from '@app/core';

import { Diagram } from './diagram';
import { Transform } from './transform';

export abstract class DiagramItem extends ImmutableObject {
    protected constructor(
        public id: string,
        public isLocked: boolean
    ) {
        super();
    }

    public lock(): DiagramItem {
        if (this.isLocked) {
            return this;
        }

        return this.cloned<DiagramItem>((state: DiagramItem) => state.isLocked = true);
    }

    public unlock(): DiagramItem {
        if (!this.isLocked) {
            return this;
        }

        return this.cloned<DiagramItem>((state: DiagramItem) => state.isLocked = false);
    }

    public abstract bounds(diagram: Diagram): Transform;

    public abstract transformByBounds(oldBounds: Transform, newBounds: Transform): DiagramItem;
}