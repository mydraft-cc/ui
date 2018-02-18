import {
    Diagram,
    DiagramShape,
    BRING_FORWARDS,
    BRING_TO_FRONT,
    EditorState,
    ordering,
    orderItems,
    SEND_BACKWARDS,
    SEND_TO_BACK
} from '@app/wireframes/model';

describe('OrderingReducer', () => {
    const reducer = ordering();
    const shape1 = DiagramShape.createShape('btn', 100, 100);
    const shape2 = DiagramShape.createShape('btn', 100, 100);
    const shape3 = DiagramShape.createShape('btn', 100, 100);
    const diagram =
        Diagram.createDiagram()
            .addVisual(shape1)
            .addVisual(shape2)
            .addVisual(shape3);

    it('should return same state if action is unknown', () => {
        const action = { type: 'UNKNOWN' };
        const state_1 = EditorState.createInitial();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should return same state if action has unknown ordering type', () => {
        const action = orderItems('UNKNOWN', diagram, []);
        const state_1 = EditorState.createInitial();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should bring shape forwards', () => {
        testOrdering(BRING_FORWARDS, shape1, [shape2.id, shape1.id, shape3.id]);
    });

    it('should bring shape to front', () => {
        testOrdering(BRING_TO_FRONT, shape1, [shape2.id, shape3.id, shape1.id]);
    });

    it('should send shape backwards', () => {
        testOrdering(SEND_BACKWARDS, shape3, [shape1.id, shape3.id, shape2.id]);
    });

    it('should send shape to back', () => {
        testOrdering(SEND_TO_BACK, shape3, [shape3.id, shape1.id, shape2.id]);
    });

    function testOrdering(type: string, shape: DiagramShape, expectedIds: string[]) {
        const action = orderItems(type, diagram, [shape]);
        const state_1 = EditorState.createInitial().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        expect(state_2.diagrams.last.rootIds.toArray()).toEqual(expectedIds);
    }
});