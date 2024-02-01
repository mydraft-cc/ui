/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/naming-convention */

import { buildGrouping, createClassReducer, Diagram, DiagramItem, EditorState, groupItems, ungroupItems } from '@app/wireframes/model';

describe('GroupingReducer', () => {
    const state =
        EditorState.create();

    const reducer = createClassReducer(state, builder => buildGrouping(builder));

    it('should return same state if action is unknown', () => {
        const action = { type: 'UNKNOWN' };

        const state_1 = EditorState.create();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should group shapes and select new group', () => {
        const id1 = '1';
        const id2 = '2';

        const diagram =
            Diagram.create({ id: '1' })
                .addShape(DiagramItem.createShape({ id: id1, renderer: 'Button' }))
                .addShape(DiagramItem.createShape({ id: id2, renderer: 'Button' }));

        const groupId = 'group-1';

        const action = groupItems(diagram, diagram.items.values, groupId);

        const state_1 = EditorState.create().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newDiagram = state_2.diagrams.get(diagram.id)!;

        expect(newDiagram.selectedIds.values).toEqual([groupId]);
        expect(newDiagram.rootIds.values).toEqual([groupId]);
    });

    it('should ungroup multiple groups and select their children', () => {
        const groupId1 = 'group-1';
        const groupId2 = 'group-2';

        const id1 = '1';
        const id2 = '2';
        const id3 = '3';
        const id4 = '4';

        let diagram =
            Diagram.create({ id: '1' })
                .addShape(DiagramItem.createShape({ id: id1, renderer: 'Button' }))
                .addShape(DiagramItem.createShape({ id: id2, renderer: 'Button' }))
                .addShape(DiagramItem.createShape({ id: id3, renderer: 'Button' }))
                .addShape(DiagramItem.createShape({ id: id4, renderer: 'btn' }));

        const shapes = diagram.items;

        diagram = diagram.group(groupId1, [id1, id2]);
        diagram = diagram.group(groupId2, [id3, id4]);

        const group1 = diagram.items.get(groupId1)!;
        const group2 = diagram.items.get(groupId2)!;

        const action = ungroupItems(diagram, [group1, group2, DiagramItem.createGroup({ id: '5' })]);

        const state_1 = EditorState.create().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newDiagram = state_2.diagrams.get(diagram.id)!;

        expect(newDiagram.selectedIds.values).toEqual(shapes.keys);
        expect(newDiagram.rootIds.values).toEqual(shapes.keys);
    });
});
