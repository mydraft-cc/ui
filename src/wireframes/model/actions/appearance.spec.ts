import { Rotation, Vec2 } from '@app/core';

import {
    appearance,
    changeItemsAppearance,
    Diagram,
    DiagramItem,
    EditorState,
    RendererService,
    Transform,
    transformItems
} from '@app/wireframes/model';

import { Button } from '@app/wireframes/shapes/neutral/button';

describe('AppearanceReducer', () => {
    const shape1 = DiagramItem.createShape('1', 'Button', 100, 100);
    const shape2 = DiagramItem.createShape('2', 'Button', 200, 200);

    const diagram =
        Diagram.empty('1')
            .addVisual(shape1)
            .addVisual(shape2);

    const rendererService = new RendererService().addRenderer(new Button());

    const reducer = appearance(rendererService);

    it('should return same state if action is unknown', () => {
        const action = { type: 'UNKNOWN' };
        const state_1 = EditorState.empty();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should change appearance of all items to new value', () => {
        const action = changeItemsAppearance(diagram, diagram.items.values, 'TEXT', 'MyValue');

        expectShapesAfterAction(action, (newShape1, newShape2) => {
            expect(newShape1.appearance.get('TEXT')).toEqual('MyValue');
            expect(newShape2.appearance.get('TEXT')).toEqual('MyValue');
        });
    });

    it('should not change appearance when renderer does not support it', () => {
        const action = changeItemsAppearance(diagram, diagram.items.values, '?', 'MyValue');

        expectShapesAfterAction(action, (newShape1, newShape2) => {
            expect(newShape1.appearance.get('?')).toBeUndefined();
            expect(newShape2.appearance.get('?')).toBeUndefined();
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
        const state_1 = EditorState.empty().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newDiagram = state_2.diagrams.get('1');
        const newShape1 = newDiagram.items.get(shape1.id);
        const newShape2 = newDiagram.items.get(shape2.id);

        expect(newShape1, newShape2);
    }
});