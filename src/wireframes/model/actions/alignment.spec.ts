/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rotation, Vec2 } from '@app/core/utils';
import { alignItems, AlignmentMode, buildAlignment, createClassReducer, Diagram, DiagramItem, EditorState, Transform } from '@app/wireframes/model';

/* eslint-disable @typescript-eslint/naming-convention */

describe('AlignmentReducer', () => {
    const shape1 = DiagramItem.createShape({
        id: '1', 
        renderer: 'Button', 
        transform: new Transform(
            new Vec2(100, 100),
            new Vec2(20, 20),
            Rotation.ZERO),
    });

    const shape2 = DiagramItem.createShape({
        id: '2', 
        renderer: 'Button', 
        transform: new Transform(
            new Vec2(200, 200),
            new Vec2(40, 40),
            Rotation.ZERO),
    });

    const shape3 = DiagramItem.createShape({
        id: '3', 
        renderer: 'Button', 
        transform: new Transform(
            new Vec2(300, 300),
            new Vec2(80, 80),
            Rotation.ZERO),
    });

    const diagram =
        Diagram.create({ id: '1' })
            .addShape(shape1)
            .addShape(shape2)
            .addShape(shape3);

    const state =
        EditorState.create()
            .addDiagram(diagram);

    const reducer = createClassReducer(state, builder => buildAlignment(builder));

    it('should return same state if action is unknown', () => {
        const action = { type: 'UNKNOWN' };

        const state_1 = EditorState.create();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should return same state if action has unknown alignment type', () => {
        const action = alignItems('UNKNOWN' as any, diagram, diagram.items.values);

        const state_1 = EditorState.create();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should align to horizontally left', () => {
        expectPositionsAfterAlignment(AlignmentMode.HorizontalLeft, [new Vec2(100, 100), new Vec2(110, 200), new Vec2(130, 300)]);
    });

    it('should align to horizontally center', () => {
        expectPositionsAfterAlignment(AlignmentMode.HorizontalCenter, [new Vec2(215, 100), new Vec2(215, 200), new Vec2(215, 300)]);
    });

    it('should align to horizontally right', () => {
        expectPositionsAfterAlignment(AlignmentMode.HorizontalRight, [new Vec2(330, 100), new Vec2(320, 200), new Vec2(300, 300)]);
    });

    it('should align to vertically top', () => {
        expectPositionsAfterAlignment(AlignmentMode.VerticalTop, [new Vec2(100, 100), new Vec2(200, 110), new Vec2(300, 130)]);
    });

    it('should align to vertically center', () => {
        expectPositionsAfterAlignment(AlignmentMode.VerticalCenter, [new Vec2(100, 215), new Vec2(200, 215), new Vec2(300, 215)]);
    });

    it('should align to vertically bottom', () => {
        expectPositionsAfterAlignment(AlignmentMode.VerticalBottom, [new Vec2(100, 330), new Vec2(200, 320), new Vec2(300, 300)]);
    });

    it('should distribute vertically', () => {
        expectPositionsAfterAlignment(AlignmentMode.DistributeVertical, [new Vec2(100, 100), new Vec2(200, 185), new Vec2(300, 300)]);
    });

    it('should distribute horizontally', () => {
        expectPositionsAfterAlignment(AlignmentMode.DistributeHorizontal, [new Vec2(100, 100), new Vec2(185, 200), new Vec2(300, 300)]);
    });

    function expectPositionsAfterAlignment(type: AlignmentMode, positions: Vec2[]) {
        const action = alignItems(type, diagram, diagram.items.values);

        const state_1 = EditorState.create().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const shapes = state_2.diagrams.get(diagram.id)!.items.values;

        let i = 0;

        for (const shape of shapes) {
            expect(shape.transform.position).toEqual(positions[i]);
            i++;
        }
    }
});
