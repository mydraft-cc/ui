import { MathHelper } from '@app/core'

import {
    Diagram,
    DiagramGroup,
    DiagramItemSet,
    DiagramShape
} from '@app/wireframes/model';

describe('Diagram', () => {
    const shape1 = DiagramShape.createShape('btn', 100, 20);
    const shape2 = DiagramShape.createShape('btn', 100, 20);
    const shape3 = DiagramShape.createShape('btn', 100, 20);

    it('should instantiate with factory method', () => {
        const diagram_1 = Diagram.createDiagram();

        expect(diagram_1).toBeDefined();
        expect(diagram_1.id).toBeDefined();
    });

    it('should return original diagram when adding null visual', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addVisual(null!);

        expect(diagram_2).toBe(diagram_1);
    });

    it('should add visual to items', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addVisual(shape1);

        expect(diagram_2.items.contains(shape1.id)).toBeTruthy();
    });

    it('should add items to diagram', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addItems(new DiagramItemSet([], [shape1, shape2, shape3]));

        expect(diagram_2.items.contains(shape1.id)).toBeTruthy();
        expect(diagram_2.items.contains(shape2.id)).toBeTruthy();
        expect(diagram_2.items.contains(shape3.id)).toBeTruthy();
    });

    it('should return original diagram when item set to remove is null', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addItems(null!);

        expect(diagram_2).toBe(diagram_1);
    });

    it('should remove visual from items', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.removeItems(DiagramItemSet.createFromDiagram([shape1.id], diagram_2)!);

        expect(diagram_3.items.contains(shape1.id)).toBeFalsy();
    });

    it('should remove children when removing group', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.addVisual(shape2);
        const diagram_4 = diagram_3.group([shape1.id, shape2.id]);
        const diagram_5 = diagram_4.removeItems(DiagramItemSet.createFromDiagram([diagram_4.items.last.id], diagram_4)!);

        expect(diagram_5.items.size).toBe(0);
    });

    it('should return original diagram when set is null', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.removeItems(null!);

        expect(diagram_2).toBe(diagram_1);
    });

    it('should update visual in items', () => {
        const oldShape = DiagramShape.createShape('btn', 100, 20);
        const newShape = oldShape.setAppearance('border-width', 10);

        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addVisual(oldShape);
        const diagram_3 = diagram_2.updateItem(oldShape.id, x => newShape);

        expect(diagram_3.items.size).toBe(1);
        expect(diagram_3.items.get(oldShape.id)).toEqual(newShape);
    });

    it('should return original diagram when visual to update does not exist.', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.updateItem(shape1.id, v => (<DiagramShape>v).setAppearance('color', 0xFF00FF));

        expect(diagram_2).toBe(diagram_1);
    });

    it('should return original diagram when updater is null', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.updateItem(shape1.id, null!);

        expect(diagram_3).toBe(diagram_2);
    });

    it('should return original diagram when updater returns null item', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.updateItem(shape1.id, v => null!);

        expect(diagram_3).toBe(diagram_2);
    });

    it('should return original diagram when updater returns same item', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.updateItem(shape1.id, v => v);

        expect(diagram_3).toBe(diagram_2);
    });

    it('should add item id to list when selected', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.selectItems([shape1.id]);

        expect(diagram_3.selectedItemIds.contains(shape1.id)).toBeTruthy();
    });

    it('should return original diagram when item to select is already selected', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.selectItems([shape1.id]);
        const diagram_4 = diagram_3.selectItems([shape1.id]);

        expect(diagram_4.selectedItemIds.contains(shape1.id)).toBeTruthy();
        expect(diagram_4.selectedItemIds).toBe(diagram_3.selectedItemIds);
    });

    it('should return original diagram when list of shape ids to select is null', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.selectItems(null!);

        expect(diagram_3).toBe(diagram_2);
    });

    it('should remove item id from list when unselected', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.selectItems([shape1.id]);
        const diagram_3 = diagram_2.selectItems([]);

        expect(diagram_3.selectedItemIds.contains(shape1.id)).toBeFalsy();
    });

    it('should unselect all when passed item ids is null', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.selectItems([shape1.id]);
        const diagram_3 = diagram_2.selectItems(null!);

        expect(diagram_3.selectedItemIds.contains(shape1.id)).toBeFalsy();
    });

    it('should return original diagram whwhen item to unselect is not selected', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.selectItems([]);
        const diagram_3 = diagram_2.selectItems([]);

        expect(diagram_3.selectedItemIds.contains(shape1.id)).toBeFalsy();
        expect(diagram_3.selectedItemIds).toBe(diagram_2.selectedItemIds);
    });

    it('should return original diagram when less than 2 shapes to be grouped are found', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.addVisual(shape2);
        const diagram_4 = diagram_3.group([shape1.id, 'INVALID']);

        expect(diagram_4).toBe(diagram_3);
    });

    it('should create group when grouping shapes', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.addVisual(shape2);
        const diagram_4 = diagram_3.group([shape1.id, shape2.id]);

        expect(diagram_4.items.size).toBe(3);

        const group = <DiagramGroup>diagram_4.items.toArray()[2];

        expect(group.childIds.get(0)).toBe(shape1.id);
        expect(group.childIds.get(1)).toBe(shape2.id);
    });

    it('should return original diagram when grouping shapes from different levels', () => {
        const groupId = MathHelper.guid();

        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.addVisual(shape2);
        const diagram_4 = diagram_3.group([shape1.id, shape2.id], groupId);
        const diagram_5 = diagram_4.group([shape1.id, groupId]);

        expect(diagram_5).toBe(diagram_4);
    });

    it('should remove group when ungrouping', () => {
        const groupId = MathHelper.guid();

        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.addVisual(shape2);
        const diagram_4 = diagram_3.group([shape1.id, shape2.id], groupId);
        const diagram_5 = diagram_4.ungroup(groupId);

        expect(diagram_5.items.size).toBe(2);
    });

    it('should return original diagram when group to ungroup does not exist', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.ungroup('not_found');

        expect(diagram_2).toBe(diagram_1);
    });

    it('should return original diagram when item to select is not in items list', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.selectItems(['not-found']);

        expect(diagram_2.selectedItemIds).toBe(diagram_1.selectedItemIds);
    });

    it('should select shapes when they are part of the diagram', () => {
        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.addVisual(shape2);
        const diagram_4 = diagram_3.selectItems([shape1.id, shape2.id]);

        expect(diagram_4.selectedItemIds.contains(shape1.id)).toBeTruthy();
    });

    it('should group nested grouped shapes', () => {
        const groupId1 = MathHelper.guid();
        const groupId2 = MathHelper.guid();

        const diagram_1 = Diagram.createDiagram();
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.addVisual(shape2);
        const diagram_4 = diagram_3.group([shape1.id, shape2.id], groupId1);
        const diagram_5 = diagram_4.group([shape1.id, shape2.id], groupId2);

        expect(diagram_5.rootIds.toArray()).toEqual([groupId1]);

        const group1 = <DiagramGroup>diagram_5.items.get(groupId1);
        const group2 = <DiagramGroup>diagram_5.items.get(groupId2);

        expect(group1.childIds.toArray()).toEqual([groupId2]);
        expect(group2.childIds.toArray()).toEqual([shape1.id, shape2.id]);
    });

    it('should bring items to front', () => {
        const diagram_1 =
            Diagram.createDiagram()
                .addVisual(shape1)
                .addVisual(shape2)
                .addVisual(shape3);

        const diagram_2 = diagram_1.bringToFront([shape1.id]);

        expect(diagram_2.rootIds.toArray()).toEqual([shape2.id, shape3.id, shape1.id]);
    });

    it('should bring items forwards', () => {
        const diagram_1 =
            Diagram.createDiagram()
                .addVisual(shape1)
                .addVisual(shape2)
                .addVisual(shape3);

        const diagram_2 = diagram_1.bringForwards([shape1.id]);

        expect(diagram_2.rootIds.toArray()).toEqual([shape2.id, shape1.id, shape3.id]);
    });

    it('should send items to back', () => {
        const diagram_1 =
            Diagram.createDiagram()
                .addVisual(shape1)
                .addVisual(shape2)
                .addVisual(shape3);

        const diagram_2 = diagram_1.sendToBack([shape3.id]);

        expect(diagram_2.rootIds.toArray()).toEqual([shape3.id, shape1.id, shape2.id]);
    });

    it('should send items backwards', () => {
        const diagram_1 =
            Diagram.createDiagram()
                .addVisual(shape1)
                .addVisual(shape2)
                .addVisual(shape3);

        const diagram_2 = diagram_1.sendBackwards([shape3.id]);

        expect(diagram_2.rootIds.toArray()).toEqual([shape1.id, shape3.id, shape2.id]);
    });
});
