import { ImmutableList } from '@app/core'

import { DiagramItem } from './diagram-item';
import {
    Diagram,
    Transform
} from '@app/wireframes/model';

export class DiagramContainer extends DiagramItem {
    constructor(id: string, public childIds: ImmutableList<string>) {
        super(id);
    }

    public static createContainer(): DiagramContainer {
        return new DiagramContainer('root', new ImmutableList<string>());
    }

    public bounds(diagram: Diagram): Transform {
        throw new Error('Not supported');
    }

    public transformByBounds(oldBounds: Transform, newBounds: Transform): DiagramItem {
        throw new Error('Not supported');
    }

    public addItems(...itemIds: string[]): DiagramContainer {
        return this.clonedWithChildren(this.childIds.add(...itemIds));
    }

    public removeItems(...itemIds: string[]): DiagramContainer {
        return this.clonedWithChildren(this.childIds.remove(...itemIds));
    }

    public bringToFront(itemIds: string[]): DiagramContainer {
        return this.clonedWithChildren(this.childIds.bringToFront(itemIds));
    }

    public bringForwards(itemIds: string[]): DiagramContainer {
        return this.clonedWithChildren(this.childIds.bringForwards(itemIds));
    }

    public sendToBack(itemIds: string[]): DiagramContainer {
        return this.clonedWithChildren(this.childIds.sendToBack(itemIds));
    }

    public sendBackwards(itemIds: string[]): DiagramContainer {
        return this.clonedWithChildren(this.childIds.sendBackwards(itemIds));
    }

    private clonedWithChildren(children: ImmutableList<string>): DiagramContainer {
        if (children !== this.childIds) {
            return this.cloned<DiagramContainer>((container: DiagramContainer) => container.childIds = children);
        } else {
            return this;
        }
    }

    public clone(): DiagramContainer {
        return new DiagramContainer(
            this.id,
            this.childIds);
    }
}