/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Diagram, DiagramItem, DiagramItemSet } from '@app/wireframes/model';

describe('Diagram Item Set', () => {
    const groupId = 'group-1';
    const root1 = DiagramItem.createShape({ id: '1', renderer: 'Button' });
    const root2 = DiagramItem.createShape({ id: '2', renderer: 'Button', isLocked: true });
    const child1 = DiagramItem.createShape({ id: '3', renderer: 'Button' });
    const child2 = DiagramItem.createShape({ id: '4', renderer: 'Button', isLocked: true });

    const diagram =
        Diagram.create()
            .addShape(root1)
            .addShape(root2)
            .addShape(child1)
            .addShape(child2)
            .group(groupId, [child1.id, child2.id]);
        
    const group = diagram.items.get(groupId)!;

    it('should create from root items', () => {
        const set = DiagramItemSet.createFromDiagram([groupId], diagram);

        expect([...set.nested.keys()]).toEqual([groupId, child1.id, child2.id]);
    });

    it('should create from child items', () => {
        const set = DiagramItemSet.createFromDiagram([child1], diagram);

        expect([...set.nested.keys()]).toEqual([child1.id]);
    });

    it('should keep the order in children intact', () => {
        const set = DiagramItemSet.createFromDiagram([child2, child1], diagram);

        expect([...set.nested.keys()]).toEqual([child1.id, child2.id]);
    });

    it('should keep the order in root intact', () => {
        const set = DiagramItemSet.createFromDiagram([root1, root2], diagram);

        expect([...set.nested.keys()]).toEqual([root1.id, root2.id]);
    });

    it('should keep the order in mixed items intact', () => {
        const set = DiagramItemSet.createFromDiagram([ child2, child1, root2], diagram);

        expect([...set.nested.keys()]).toEqual([root2.id, child1.id, child2.id]);
    });

    it('should be invalid if group is not complete', () => {
        const set = new DiagramItemSet(new Map([[group.id, group], [child1.id, child1]]), new Map());

        expect(set.isComplete).toBeFalsy();
    });

    it('should calculate selection once', () => {
        const set = DiagramItemSet.createFromDiagram([root1, root2, groupId], diagram);

        const selection1 = set.selectedItems;
        const selection2 = set.selectedItems;

        expect(selection1.map(x => x.id)).toEqual([root1.id, groupId]);
        expect(selection1).toBe(selection2);
    });

    it('should calculate editable once', () => {
        const set = DiagramItemSet.createFromDiagram([root1, root2, groupId], diagram);

        const editable1 = set.deepEditableItems;
        const editable2 = set.deepEditableItems;

        expect(editable1.map(x => x.id)).toEqual([root1.id, groupId, child1.id, child2.id]);
        expect(editable1).toBe(editable2);
    });
});