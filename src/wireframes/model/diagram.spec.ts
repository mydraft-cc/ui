import {
    Diagram,
    DiagramItem,
    DiagramItemSet
} from '@app/wireframes/model';

describe('Diagram', () => {
    const shape1 = DiagramItem.createShape('1', 'btn', 100, 20);
    const shape2 = DiagramItem.createShape('2', 'btn', 100, 20);
    const shape3 = DiagramItem.createShape('3', 'btn', 100, 20);

    const diagram_1 = Diagram.empty('1');

    it('should instantiate with factory method', () => {
        expect(diagram_1).toBeDefined();
        expect(diagram_1.id).toBeDefined();
    });

    it('should return original diagram when adding null visual', () => {
        const diagram_2 = diagram_1.addVisual(null!);

        expect(diagram_2).toBe(diagram_1);
    });

    it('should add visual to items', () => {
        const diagram_2 = diagram_1.addVisual(shape1);

        expect(diagram_2.items.has(shape1.id)).toBeTruthy();
    });

    it('should add items to diagram', () => {
        const diagram_2 = diagram_1.addItems(new DiagramItemSet([], [shape1, shape2, shape3]));

        expect(diagram_2.items.has(shape1.id)).toBeTruthy();
        expect(diagram_2.items.has(shape2.id)).toBeTruthy();
        expect(diagram_2.items.has(shape3.id)).toBeTruthy();
    });

    it('should remove visual from items', () => {
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.removeItems(DiagramItemSet.createFromDiagram([shape1.id], diagram_2)!);

        expect(diagram_3.items.has(shape1.id)).toBeFalsy();
    });

    it('should remove selected visual from items', () => {
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.selectItems([shape1.id]);
        const diagram_4 = diagram_3.removeItems(DiagramItemSet.createFromDiagram([shape1.id], diagram_2)!);

        expect(diagram_3.selectedIds.has(shape1.id)).toBeTruthy();
        expect(diagram_4.selectedIds.has(shape1.id)).toBeFalsy();
        expect(diagram_4.items.has(shape1.id)).toBeFalsy();
    });

    it('should remove children when removing group', () => {
        const groupId = 'group-1';

        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.addVisual(shape2);
        const diagram_4 = diagram_3.group(groupId, [shape1.id, shape2.id]);
        const diagram_5 = diagram_4.removeItems(DiagramItemSet.createFromDiagram([diagram_4.items.get(groupId)], diagram_4)!);

        expect(diagram_5.items.size).toBe(0);
    });

    it('should update visual in items', () => {
        const oldShape = DiagramItem.createShape('4', 'btn', 100, 20);
        const newShape = oldShape.setAppearance('border-width', 10);

        const diagram_2 = diagram_1.addVisual(oldShape);
        const diagram_3 = diagram_2.updateItem(oldShape.id, _ => newShape);

        expect(diagram_3.items.size).toBe(1);
        expect(diagram_3.items.get(oldShape.id)).toEqual(newShape);
    });

    it('should return original diagram when visual to update does not exist.', () => {
        const diagram_2 = diagram_1.updateItem(shape1.id, v => v.setAppearance('color', 0xFF00FF));

        expect(diagram_2).toBe(diagram_1);
    });

    it('should return original diagram when updater returns same item', () => {
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.updateItem(shape1.id, v => v);

        expect(diagram_3).toBe(diagram_2);
    });

    it('should add item id to list when selected', () => {
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.selectItems([shape1.id]);

        expect(diagram_3.selectedIds.has(shape1.id)).toBeTruthy();
    });

    it('should return original diagram when item to select is already selected', () => {
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.selectItems([shape1.id]);
        const diagram_4 = diagram_3.selectItems([shape1.id]);

        expect(diagram_4.selectedIds.has(shape1.id)).toBeTruthy();
        expect(diagram_4.selectedIds).toBe(diagram_3.selectedIds);
    });

    it('should remove item id from list when unselected', () => {
        const diagram_2 = diagram_1.selectItems([shape1.id]);
        const diagram_3 = diagram_2.selectItems([]);

        expect(diagram_3.selectedIds.has(shape1.id)).toBeFalsy();
    });

    it('should return original diagram whwhen item to unselect is not selected', () => {
        const diagram_2 = diagram_1.selectItems([]);
        const diagram_3 = diagram_2.selectItems([]);

        expect(diagram_3.selectedIds.has(shape1.id)).toBeFalsy();
        expect(diagram_3.selectedIds).toBe(diagram_2.selectedIds);
    });

    it('should return original diagram when less than 2 shapes to be grouped are found', () => {
        const groupId = 'group-3';

        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.addVisual(shape2);
        const diagram_4 = diagram_3.group(groupId, [shape1.id, 'INVALID']);

        expect(diagram_4).toBe(diagram_3);
    });

    it('should create group when grouping shapes', () => {
        const groupId = 'group-3';

        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.addVisual(shape2);
        const diagram_4 = diagram_3.group(groupId, [shape1.id, shape2.id]);

        expect(diagram_4.items.size).toBe(3);

        const group = diagram_4.items.get(groupId);

        expect(group.childIds.at(0)).toBe(shape1.id);
        expect(group.childIds.at(1)).toBe(shape2.id);
    });

    it('should return original diagram when grouping shapes from different levels', () => {
        const groupId1 = 'group-1';
        const groupId2 = 'group-2';

        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.addVisual(shape2);
        const diagram_4 = diagram_3.group(groupId1, [shape1.id, shape2.id]);
        const diagram_5 = diagram_4.group(groupId2, [shape1.id, groupId1]);

        expect(diagram_5).toBe(diagram_4);
    });

    it('should remove group when ungrouping', () => {
        const groupId = 'group-1';

        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.addVisual(shape2);
        const diagram_4 = diagram_3.group(groupId, [shape1.id, shape2.id]);
        const diagram_5 = diagram_4.ungroup(groupId);

        expect(diagram_5.items.size).toBe(2);
    });

    it('should return original diagram when group to ungroup does not exist', () => {
        const diagram_2 = diagram_1.ungroup('not_found');

        expect(diagram_2).toBe(diagram_1);
    });

    it('should return original diagram when item to select is not in items list', () => {
        const diagram_2 = diagram_1.selectItems(['not-found']);

        expect(diagram_2.selectedIds).toBe(diagram_1.selectedIds);
    });

    it('should select shapes when they are part of the diagram', () => {
        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.addVisual(shape2);
        const diagram_4 = diagram_3.selectItems([shape1.id, shape2.id]);

        expect(diagram_4.selectedIds.has(shape1.id)).toBeTruthy();
    });

    it('should group nested grouped shapes', () => {
        const groupId1 = 'group-1';
        const groupId2 = 'group-2';

        const diagram_2 = diagram_1.addVisual(shape1);
        const diagram_3 = diagram_2.addVisual(shape2);
        const diagram_4 = diagram_3.group(groupId1, [shape1.id, shape2.id]);
        const diagram_5 = diagram_4.group(groupId2, [shape1.id, shape2.id]);

        expect(diagram_5.rootIds.values).toEqual([groupId1]);

        const group1 = diagram_5.items.get(groupId1);
        const group2 = diagram_5.items.get(groupId2);

        expect(group1.childIds.values).toEqual([groupId2]);
        expect(group2.childIds.values).toEqual([shape1.id, shape2.id]);
    });

    it('should bring items to front', () => {
        const diagram_2 = diagram_1.addVisual(shape1).addVisual(shape2).addVisual(shape3);
        const diagram_3 = diagram_2.bringToFront([shape1.id]);

        expect(diagram_3.rootIds.values).toEqual([shape2.id, shape3.id, shape1.id]);
    });

    it('should bring items forwards', () => {
        const diagram_2 = diagram_1.addVisual(shape1).addVisual(shape2).addVisual(shape3);
        const diagram_3 = diagram_2.bringForwards([shape1.id]);

        expect(diagram_3.rootIds.values).toEqual([shape2.id, shape1.id, shape3.id]);
    });

    it('should send items to back', () => {
        const diagram_2 = diagram_1.addVisual(shape1).addVisual(shape2).addVisual(shape3);
        const diagram_3 = diagram_2.sendToBack([shape3.id]);

        expect(diagram_3.rootIds.values).toEqual([shape3.id, shape1.id, shape2.id]);
    });

    it('should send items backwards', () => {
        const diagram_2 = diagram_1.addVisual(shape1).addVisual(shape2).addVisual(shape3);
        const diagram_3 = diagram_2.sendBackwards([shape3.id]);

        expect(diagram_3.rootIds.values).toEqual([shape1.id, shape3.id, shape2.id]);
    });
});