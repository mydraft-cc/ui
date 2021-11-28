/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { buildOrdering, Diagram, DiagramItem, EditorState, orderItems, OrderMode } from '@app/wireframes/model';
import { createClassReducer } from './utils';

/* eslint-disable @typescript-eslint/naming-convention */

describe('OrderingReducer', () => {
    const shape1 = DiagramItem.createShape('1', 'btn', 100, 100);
    const shape2 = DiagramItem.createShape('2', 'btn', 100, 100);
    const shape3 = DiagramItem.createShape('3', 'btn', 100, 100);

    const diagram =
        Diagram.empty('1')
            .addVisual(shape1)
            .addVisual(shape2)
            .addVisual(shape3);

    const state =
        EditorState.empty()
            .addDiagram(diagram);

    const reducer = createClassReducer(state, builder => buildOrdering(builder));

    it('should return same state if action is unknown', () => {
        const action = { type: 'UNKNOWN' };
        const state_1 = EditorState.empty();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should return same state if action has unknown ordering type', () => {
        const action = orderItems('UNKNOWN' as any, diagram, []);
        const state_1 = EditorState.empty();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should bring shape forwards', () => {
        testOrdering(OrderMode.BringForwards, shape1, [shape2.id, shape1.id, shape3.id]);
    });

    it('should bring shape to front', () => {
        testOrdering(OrderMode.BringToFront, shape1, [shape2.id, shape3.id, shape1.id]);
    });

    it('should send shape backwards', () => {
        testOrdering(OrderMode.SendBackwards, shape3, [shape1.id, shape3.id, shape2.id]);
    });

    it('should send shape to back', () => {
        testOrdering(OrderMode.SendToBack, shape3, [shape3.id, shape1.id, shape2.id]);
    });

    function testOrdering(mode: OrderMode, shape: DiagramItem, expectedIds: string[]) {
        const action = orderItems(mode, diagram, [shape]);

        const state_1 = EditorState.empty().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        expect(state_2.diagrams.get(diagram.id).rootIds.values).toEqual(expectedIds);
    }
});
