import { Rotation, Vec2 } from '@app/core'

import { DiagramShape, Transform } from '@app/wireframes/model';

describe('DiagramShape', () => {
    it('should instantiate with factory method', () => {
        const shape_1 = DiagramShape.createShape('btn', 100, 20);

        expect(shape_1).toBeDefined();
        expect(shape_1.id).toBeDefined();
        expect(shape_1.renderer).toBe('btn');
        expect(shape_1.transform.size.x).toBe(100);
        expect(shape_1.transform.size.y).toBe(20);
    });

    it('should return transform as adorner bounds', () => {
        const shape_1 = DiagramShape.createShape('btn', 100, 20);

        expect(shape_1.bounds(null!)).toBe(shape_1.transform);
    });

    it('should return original shape when transforming to null shape', () => {
        const shape_1 = DiagramShape.createShape('btn', 100, 20);
        const shape_2 = shape_1.transformTo(null!);

        expect(shape_2).toBe(shape_1);
    });

    it('should replace transformation when transforming to', () => {
        const newTransform = new Transform(Vec2.ZERO, Vec2.ZERO, Rotation.ZERO);

        const shape_1 = DiagramShape.createShape('btn', 100, 20);
        const shape_2 = shape_1.transformTo(newTransform);

        expect(shape_2.transform).toEqual(newTransform);
    });

    it('should return original shape when transforming from null old bounds', () => {
        const shape_1 = DiagramShape.createShape('btn', 100, 20);
        const shape_2 = shape_1.transformByBounds(null!, shape_1.transform);

        expect(shape_2).toBe(shape_1);
    });

    it('should return original shape when transforming to null new bounds', () => {
        const shape_1 = DiagramShape.createShape('btn', 100, 20);
        const shape_2 = shape_1.transformByBounds(shape_1.transform, null!);

        expect(shape_2).toBe(shape_1);
    });

    it('should return original shape when transforming between equal bounds', () => {
        const shape_1 = DiagramShape.createShape('btn', 100, 20);
        const shape_2 = shape_1.transformByBounds(shape_1.transform, shape_1.transform);

        expect(shape_2).toBe(shape_1);
    });

    it('should return original shape when transforming with null transformer', () => {
        const shape_1 = DiagramShape.createShape('btn', 100, 20);
        const shape_2 = shape_1.transformWith(null!);

        expect(shape_2).toBe(shape_1);
    });

    it('should return original shape when transformer returns null', () => {
        const shape_1 = DiagramShape.createShape('btn', 100, 20);
        const shape_2 = shape_1.transformWith(t => null!);

        expect(shape_2).toBe(shape_1);
    });

    it('should return original shape when transformer returns same transform', () => {
        const shape_1 = DiagramShape.createShape('btn', 100, 20);
        const shape_2 = shape_1.transformWith(t => t);

        expect(shape_2).toBe(shape_1);
    });

    it('should resize when transforming by bounds', () => {
        const shape_1 = DiagramShape.createShape('btn', 100, 20);
        const shape_2 = shape_1.transformByBounds(shape_1.transform, shape_1.transform.resizeTo(new Vec2(200, 40)));

        const actual = shape_2.transform;
        const expected = new Transform(Vec2.ZERO, new Vec2(200, 40), Rotation.ZERO);

        expect(actual).toEqual(expected);
    });
});
