import { Rotation, Vec2 } from '@app/core'

import {
    appearance,
    changeItemsAppearance,
    Diagram,
    DiagramShape,
    EditorState,
    Transform,
    transformItems
} from '@app/wireframes/model';

describe('GroupingReducer', () => {
    const shape1 = DiagramShape.createShape('Button', 100, 100);
    const shape2 = DiagramShape.createShape('Button', 200, 200);
    const diagram =
        Diagram.createDiagram()
            .addVisual(shape1)
            .addVisual(shape2);

    const reducer = appearance();

    it('should return same state if action is unknown', () => {
        const action = { type: 'UNKNOWN' };
        const state_1 = EditorState.createInitial();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should change appearance of all items to new value', () => {
        const action = changeItemsAppearance(diagram, diagram.items.map(t => <DiagramShape>t), 'MyAppearance', 'MyValue');

        expectShapesAfterAction(action, (newShape1, newShape2) => {
            expect(newShape1.appearance.get('MyAppearance')).toEqual('MyValue');
            expect(newShape2.appearance.get('MyAppearance')).toEqual('MyValue');
        });
    });

    it('should transform all items from new to old bounds', () => {
        const oldBounds = new Transform(Vec2.ZERO, new Vec2(200, 200), Rotation.ZERO);
        const newBounds = new Transform(Vec2.ZERO, new Vec2(300, 300), Rotation.ZERO);

        const action = transformItems(diagram, diagram.items.toArray(), oldBounds, newBounds);

        expectShapesAfterAction(action, (newShape1, newShape2) => {
            expect(newShape1.transform.size).toEqual(new Vec2(150, 150));
            expect(newShape2.transform.size).toEqual(new Vec2(300, 300));
        });
    });

    function expectShapesAfterAction(action: any, expect: (shape1: DiagramShape, shape2: DiagramShape) => void) {
        const state_1 = EditorState.createInitial().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newDiagram = state_2.diagrams.last;
        const newShape1 = <DiagramShape>newDiagram.items.get(shape1.id);
        const newShape2 = <DiagramShape>newDiagram.items.get(shape2.id);

        expect(newShape1, newShape2);
    }
});