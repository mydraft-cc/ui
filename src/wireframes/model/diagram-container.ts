import { ImmutableList } from '@app/core';

import { Diagram } from './diagram';
import { DiagramItem } from './diagram-item';
import { Transform } from './transform';

export class DiagramContainer extends DiagramItem {
    protected constructor(id: string, isLocked: boolean, public childIds: ImmutableList<string>) {
        super(id, isLocked);
    }

    public static createContainer(): DiagramContainer {
        const result = new DiagramContainer('root', false, ImmutableList.empty<string>());

        Object.freeze(result);

        return result;
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
            this.isLocked,
            this.childIds);
    }
}