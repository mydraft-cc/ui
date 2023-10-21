/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/naming-convention */

import { Color, Rotation, Vec2 } from '@app/core/utils';
import { DefaultAppearance } from '@app/wireframes/interface';
import { buildAppearance, changeColors, changeItemsAppearance, createClassReducer, Diagram, DiagramItem, EditorState, RendererService, Transform, transformItems } from '@app/wireframes/model';
import { Button } from '@app/wireframes/shapes/neutral/button';
import { AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';

describe('AppearanceReducer', () => {
    const shape1 = DiagramItem.createShape({ 
        id: '1',
        renderer: 'Button',
        transform: new Transform(
            Vec2.ZERO,
            new Vec2(100, 100),
            Rotation.ZERO,
        ),
        appearance: {
            [DefaultAppearance.BACKGROUND_COLOR]: 0xff0000,
        },
    });

    const shape2 = DiagramItem.createShape({ 
        id: '2',
        renderer: 'Button',
        transform: new Transform(
            Vec2.ZERO,
            new Vec2(200, 200),
            Rotation.ZERO,
        ),
        appearance: {
            [DefaultAppearance.BACKGROUND_COLOR]: '#ff0000',
        },
    });

    const diagram =
        Diagram.create({ id: '1' })
            .addShape(shape1)
            .addShape(shape2);

    const state =
        EditorState.create()
            .addDiagram(diagram);

    RendererService.addRenderer(new AbstractControl(new Button()));

    const reducer = createClassReducer(state, builder => buildAppearance(builder));

    it('should return same state if action is unknown', () => {
        const action = { type: 'UNKNOWN' };
        const state_1 = EditorState.create();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should change appearance of all items to new value', () => {
        const action = changeItemsAppearance(diagram, diagram.items.values, DefaultAppearance.TEXT, 'MyValue');

        expectShapesAfterAction(action, (newShape1, newShape2) => {
            expect(newShape1.appearance.get(DefaultAppearance.TEXT)).toEqual('MyValue');
            expect(newShape2.appearance.get(DefaultAppearance.TEXT)).toEqual('MyValue');
        });
    });

    it('should change colors of all items to new value', () => {
        const action = changeColors(Color.RED, Color.GREEN);

        expectShapesAfterAction(action, (newShape1, newShape2) => {
            expect(newShape1.appearance.get(DefaultAppearance.BACKGROUND_COLOR)).toEqual(0x00ff00);
            expect(newShape2.appearance.get(DefaultAppearance.BACKGROUND_COLOR)).toEqual(0x00ff00);
        });
    });

    it('should change colors when old color does not match', () => {
        const action = changeColors(Color.BLUE, Color.GREEN);

        expectShapesAfterAction(action, (newShape1, newShape2) => {
            expect(newShape1.appearance.get(DefaultAppearance.BACKGROUND_COLOR)).not.toEqual(0x00ff00);
            expect(newShape2.appearance.get(DefaultAppearance.BACKGROUND_COLOR)).not.toEqual(0x00ff00);
        });
    });

    it('should not change appearance when renderer does not support it', () => {
        const action = changeItemsAppearance(diagram, diagram.items.values, '?', 'MyValue');

        expectShapesAfterAction(action, (newShape1, newShape2) => {
            expect(newShape1.appearance.get('?')).toBeUndefined();
            expect(newShape2.appearance.get('?')).toBeUndefined();
        });
    });

    it('should change appearance when renderer does not support it but it is forced', () => {
        const action = changeItemsAppearance(diagram, diagram.items.values, '?', 'MyValue', true);

        expectShapesAfterAction(action, (newShape1, newShape2) => {
            expect(newShape1.appearance.get('?')).toEqual('MyValue');
            expect(newShape2.appearance.get('?')).toEqual('MyValue');
        });
    });

    it('should transform all items from new to old bounds', () => {
        const oldBounds = new Transform(Vec2.ZERO, new Vec2(200, 200), Rotation.ZERO);
        const newBounds = new Transform(Vec2.ZERO, new Vec2(300, 300), Rotation.ZERO);

        const action = transformItems(diagram, diagram.items.values, oldBounds, newBounds);

        expectShapesAfterAction(action, (newShape1, newShape2) => {
            expect(newShape1.transform.size).toEqual(new Vec2(150, 150));
            expect(newShape2.transform.size).toEqual(new Vec2(300, 300));
        });
    });

    function expectShapesAfterAction(action: any, expect: (shape1: DiagramItem, shape2: DiagramItem) => void) {
        const state_1 = EditorState.create().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newDiagram = state_2.diagrams.get('1')!;
        const newShape1 = newDiagram.items.get(shape1.id)!;
        const newShape2 = newDiagram.items.get(shape2.id)!;

        expect(newShape1, newShape2);
    }
});
