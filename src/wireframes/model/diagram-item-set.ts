import {
    Diagram,
    DiagramGroup,
    DiagramItem,
    DiagramVisual
} from '@app/wireframes/model';

export class DiagramItemSet {
    public readonly rootItems: DiagramItem[] = [];
    public readonly allItems: DiagramItem[] = [];

    public isValid = true;

    public get rootIds(): string[] {
        return this.rootItems.map(i => i.id);
    }

    constructor(
        public readonly allGroups: DiagramGroup[],
        public readonly allVisuals: DiagramVisual[]
    ) {
        this.allItems.push(...allGroups);
        this.allItems.push(...allVisuals);

        const parents: { [id: string]: boolean } = {};

        for (let group of this.allGroups) {
            group.childIds.forEach(childId => {
                if (!this.allItems.find(i => i.id === childId) || parents[childId]) {
                    this.isValid = false;
                }

                parents[childId] = true;
            });
        }

        for (let item of this.allItems) {
            if (!parents[item.id]) {
                this.rootItems.push(item);
            }
        }

        Object.freeze(this);
    }

    public static createFromDiagram(itemIds: string[], diagram: Diagram): DiagramItemSet | null {
        const g: DiagramGroup[] = [];
        const v: DiagramVisual[] = [];

        let flatItemsArray: (ids: string[], isTopLevel: boolean) => void;

        flatItemsArray = (ids: string[]) => {
            for (let itemId of ids) {
                const item = diagram.items.get(itemId);

                if (!item) {
                    continue;
                }

                if (item instanceof DiagramGroup) {
                    const group = <DiagramGroup>item;

                    flatItemsArray(group.childIds.toArray(), false);

                    g.push(item);
                } else {
                    v.push(<DiagramVisual>item);
                }
            }
        };

        if (itemIds) {
            flatItemsArray(itemIds, true);
        }

        return new DiagramItemSet(g, v);
    }

    public canAdd(diagram: Diagram): boolean {
        if (!this.isValid) {
            return false;
        }

        for (let item of this.allItems) {
            if (diagram.items.contains(item.id)) {
                return false;
            }
        }

        return true;
    }

    public canRemove(diagram: Diagram): boolean {
        if (!this.isValid) {
            return false;
        }

        for (let item of this.allItems) {
            if (!diagram.items.contains(item.id)) {
                return false;
            }
        }

        return true;
    }
}