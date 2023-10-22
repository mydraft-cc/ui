/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/naming-convention */

import { buildOrdering, createClassReducer, Diagram, DiagramItem, EditorState, moveItems, orderItems, OrderMode } from '@app/wireframes/model';

describe('OrderingReducer', () => {
    const shape1 = DiagramItem.createShape({ id: '1', renderer: 'Button' });
    const shape2 = DiagramItem.createShape({ id: '2', renderer: 'Button' });
    const shape3 = DiagramItem.createShape({ id: '3', renderer: 'Button' });

    const diagram =
        Diagram.create({ id: '1' })
            .addShape(shape1)
            .addShape(shape2)
            .addShape(shape3);

    const state =
        EditorState.create()
            .addDiagram(diagram);

    const reducer = createClassReducer(state, builder => buildOrdering(builder));

    it('should return same state if action is unknown', () => {
        const action = { type: 'UNKNOWN' };
        const state_1 = EditorState.create();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should return same state if action has unknown ordering type', () => {
        const action = orderItems('UNKNOWN' as any, diagram, [shape1]);
        const state_1 = EditorState.create();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should move items', () => {
        const action = moveItems( diagram, [shape1], 1);

        const state_1 = EditorState.create().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        expect(state_2.diagrams.get(diagram.id)?.rootIds.values).toEqual([shape2.id, shape1.id, shape3.id]);
    });

    it('should bring item forwards', () => {
        testOrdering(OrderMode.BringForwards, shape1, [shape2.id, shape1.id, shape3.id]);
    });

    it('should bring item to front', () => {
        testOrdering(OrderMode.BringToFront, shape1, [shape2.id, shape3.id, shape1.id]);
    });

    it('should send item backwards', () => {
        testOrdering(OrderMode.SendBackwards, shape3, [shape1.id, shape3.id, shape2.id]);
    });

    it('should send item to back', () => {
        testOrdering(OrderMode.SendToBack, shape3, [shape3.id, shape1.id, shape2.id]);
    });

    function testOrdering(mode: OrderMode, shape: DiagramItem, expectedIds: string[]) {
        const action = orderItems(mode, diagram, [shape]);

        const state_1 = EditorState.create().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        expect(state_2.diagrams.get(diagram.id)?.rootIds.values).toEqual(expectedIds);
    }
});
