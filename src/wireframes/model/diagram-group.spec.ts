import { Rotation, Vec2 } from '@app/core';

import {
    Diagram,
    DiagramGroup,
    DiagramShape,
    Transform
} from '@app/wireframes/model';

describe('DiagramGroup', () => {
    let transform: Transform;

    let shape1: DiagramShape;
    let shape2: DiagramShape;

    beforeEach(() => {
        transform = new Transform(Vec2.ZERO, Vec2.ZERO, Rotation.ZERO);

        shape1 = DiagramShape.createShape('btn', 100, 50).transformWith(t => t.moveTo(new Vec2(100, 100)));
        shape2 = DiagramShape.createShape('btn', 100, 50).transformWith(t => t.moveTo(new Vec2(200, 100)));
    });

    it('should instantiate with factory method', () => {
        const group = DiagramGroup.createGroup(['id1', 'id2']);

        expect(group).toBeDefined();
        expect(group.id).toBeDefined();
        expect(group.childIds.size).toBe(2);
        expect(group.childIds.get(0)).toBe('id1');
        expect(group.childIds.get(1)).toBe('id2');
    });

    it('should return original group when transforming from null old bounds', () => {
        const group_1 = DiagramGroup.createGroup([]);
        const group_2 = group_1.transformByBounds(null!, transform);

        expect(group_2).toBe(group_1);
    });

    it('should return original group when transforming to null new bounds', () => {
        const group_1 = DiagramGroup.createGroup([]);
        const group_2 = group_1.transformByBounds(transform, null!);

        expect(group_2).toBe(group_1);
    });

    it('should return original group when transforming between equal bounds', () => {
        const group_1 = DiagramGroup.createGroup([]);
        const group_2 = group_1.transformByBounds(transform, transform);

        expect(group_2).toBe(group_1);
    });

    it('should update roration when transforming between bounds', () => {
        const oldBounds = new Transform(Vec2.ZERO, Vec2.ZERO, Rotation.createFromDegree(90));
        const newBounds = new Transform(Vec2.ZERO, Vec2.ZERO, Rotation.createFromDegree(215));

        const group_1 = DiagramGroup.createGroup([]);
        const group_2 = group_1.transformByBounds(oldBounds, newBounds);

        const actual = group_2.rotation;
        const expected = Rotation.createFromDegree(125);

        expect(actual).toEqual(expected);
    });

    it('should create zero bounds if child id is not in diagram', () => {
        let diagram = Diagram.empty();

        const group = DiagramGroup.createGroup(['invalid']);

        const actual = group.bounds(diagram);
        const expected = Transform.ZERO;

        expect(actual).toEqual(expected);
    });

    it('should calculate adorner bounds from children', () => {
        let diagram =
            Diagram.empty()
                .addVisual(shape1)
                .addVisual(shape2);

        diagram = diagram.group([shape1.id, shape2.id]);

        const group = diagram.items.last;

        const actual = group.bounds(diagram);
        const expected = new Transform(new Vec2(150, 100), new Vec2(200, 50), Rotation.ZERO);

        expect(actual).toEqual(expected);
    });

    it('should cache calculate adorner bounds', () => {
        let diagram =
            Diagram.empty()
                .addVisual(shape1)
                .addVisual(shape2);

        diagram = diagram.group([shape1.id, shape2.id]);

        const group = diagram.items.last;

        const actual1 = group.bounds(diagram);
        const actual2 = group.bounds(diagram);
        const expected = new Transform(new Vec2(150, 100), new Vec2(200, 50), Rotation.ZERO);

        expect(actual1).toEqual(expected);
        expect(actual2).toEqual(expected);
    });
});
