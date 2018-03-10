import { MathHelper } from '@app/core'

import {
    Diagram,
    DiagramGroup,
    DiagramItemSet,
    DiagramShape
} from '@app/wireframes/model';

describe('DiagramItemSet', () => {
    const shape1 = DiagramShape.createShape('btn', 100, 50);
    const shape2 = DiagramShape.createShape('btn', 100, 50);

    it('should instantiate from diagram', () => {
        const groupId = MathHelper.guid();

        let diagram =
            Diagram.empty()
                .addVisual(shape1)
                .addVisual(shape2);

        diagram = diagram.group([shape1.id, shape2.id], groupId);

        const set = DiagramItemSet.createFromDiagram([groupId, 'unknown'], diagram) !;

        expect(set.allVisuals).toEqual([shape1, shape2]);
        expect(set.allGroups).toEqual([diagram.items.last]);
        expect(set.rootItems).toEqual([diagram.items.last]);

        expect(set.isValid).toBeTruthy();
        expect(set.canRemove(diagram)).toBeTruthy();
    });

    it('should return empty set when ids is null', () => {
        const set = DiagramItemSet.createFromDiagram(null!, Diagram.empty())!;

        expect(set.allItems).toEqual([]);
    });

    it('should be not valid when group children are not in diagram', () => {
        const set = new DiagramItemSet([DiagramGroup.createGroup(['id1'])], []);

        expect(set.isValid).toBeFalsy();
    });

    it('should be able to add to diagram when created from new shapes', () => {
        const set = new DiagramItemSet([], [shape1]);

        expect(set.canAdd(Diagram.empty())).toBeTruthy();
    });

    it('should be not able to add and remove when set is not valid', () => {
        const set = new DiagramItemSet([DiagramGroup.createGroup(['d1'])], []);

        expect(set.canAdd(Diagram.empty())).toBeFalsy();
        expect(set.canRemove(Diagram.empty())).toBeFalsy();
    });

    it('should be not able to add when items are already in diagram', () => {
        let diagram =
            Diagram.empty()
                .addVisual(shape1)
                .addVisual(shape2);

        const set = new DiagramItemSet([], [shape1, shape2]);

        expect(set.canAdd(diagram)).toBeFalsy();
    });

    it('should be not able to remove when items are not in diagram', () => {
        const set =
            new DiagramItemSet([], [shape1, shape2]);

        expect(set.canRemove(Diagram.empty())).toBeFalsy();
    });
});