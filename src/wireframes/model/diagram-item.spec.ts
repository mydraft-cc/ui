/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/naming-convention */

import { ImmutableMap, Rotation, Vec2 } from '@app/core/utils';
import { Diagram } from './diagram';
import { DiagramItem } from './diagram-item';
import { Transform } from './transform';

describe('DiagramItem', () => {
    const item_1 = DiagramItem.createShape({ id: '1', renderer: 'Button' });

    it('should instantiate with factory method', () => {
        expect(item_1).toBeDefined();
        expect(item_1.id).toBeDefined();
        expect(item_1.renderer).toBe('Button');
    });

    it('should return original item when already unlocked', () => {
        const item_2 = item_1.unlock();

        expect(item_2).toBe(item_1);
    });

    it('should set isLocked when locking', () => {
        const item_2 = item_1.lock();

        expect(item_2.isLocked).toBeTruthy();
    });

    it('should set isLocked when unlocking', () => {
        const item_2 = item_1.lock();
        const item_3 = item_2.unlock();

        expect(item_3.isLocked).toBeFalsy();
    });

    it('should return original item when already locked', () => {
        const item_2 = item_1.lock();
        const item_3 = item_2.lock();

        expect(item_3).toBe(item_2);
    });

    it('should rename item', () => {
        const item_2 = item_1.rename('Name');

        expect(item_2.name).toBe('Name');
    });


    it('should return original when renaming with same name', () => {
        const item_2 = item_1.rename('Name');
        const item_3 = item_2.rename('Name');

        expect(item_3).toBe(item_2);
    });

    it('should return transform as bounds', () => {
        expect(item_1.bounds(null!)).toBe(item_1.transform);
    });

    it('should return original shape when transforming from null old bounds', () => {
        const item_2 = item_1.transformByBounds(null!, item_1.transform);

        expect(item_2).toBe(item_1);
    });

    it('should return original shape when transforming to null new bounds', () => {
        const item_2 = item_1.transformByBounds(item_1.transform, null!);

        expect(item_2).toBe(item_1);
    });

    it('should return original shape when transforming between equal bounds', () => {
        const item_2 = item_1.transformByBounds(item_1.transform, item_1.transform);

        expect(item_2).toBe(item_1);
    });

    it('should return original shape when transforming with null transformer', () => {
        const item_2 = item_1.transformWith(null!);

        expect(item_2).toBe(item_1);
    });

    it('should return original shape when transformer returns null', () => {
        const item_2 = item_1.transformWith(() => null!);

        expect(item_2).toBe(item_1);
    });

    it('should return original shape when transformer returns same transform', () => {
        const item_2 = item_1.transformWith(t => t);

        expect(item_2).toBe(item_1);
    });

    it('should resize when transforming by bounds', () => {
        const item_2 = item_1.transformByBounds(item_1.transform, item_1.transform.resizeTo(new Vec2(200, 40)));

        const actual = item_2.transform;
        const expected = new Transform(Vec2.ZERO, new Vec2(200, 40), Rotation.ZERO);

        expect(actual.equals(expected)).toBeTruthy();
    });

    it('should add appearance', () => {
        const item_2 = item_1.setAppearance('color', 33);

        expect(item_2.appearance.get('color')).toBe(33);
    });

    it('should return original shape when setting appearance with null key', () => {
        const item_2 = item_1.setAppearance(null!, 13);

        expect(item_2).toBe(item_1);
    });

    it('should replace appearance', () => {
        const item_2 = item_1.setAppearance('color', 13);
        const item_3 = item_2.setAppearance('color', 42);

        expect(item_3.appearance.get('color')).toBe(42);
    });

    it('should return original shape when appearance to set has same value', () => {
        const item_2 = item_1.setAppearance('color', 13);
        const item_3 = item_2.setAppearance('color', 13);

        expect(item_3).toBe(item_2);
    });

    it('should not set appearance when item is a group', () => {
        const group_1 = DiagramItem.createGroup();
        const group_2 = group_1.setAppearance('color', 'red');

        expect(group_2).toBe(group_1);
    });

    it('should return original shape when resetting appearance to null', () => {
        const item_2 = item_1.replaceAppearance(null!);

        expect(item_2).toBe(item_1);
    });

    it('should replace appearance', () => {
        const appearance = ImmutableMap.empty();

        const item_2 = item_1.replaceAppearance(appearance);

        expect(item_2.appearance).toBe(appearance);
    });
});

describe('DiagramItem Group', () => {
    const transform: Transform = Transform.ZERO;

    const groupId = 'group-1';

    const shape1 = DiagramItem.createShape({ 
        id: '1',
        renderer: 'Button',
        transform: new Transform(
            new Vec2(100, 100),
            new Vec2(100, 50),
            Rotation.ZERO,
        ),
    });

    const shape2 = DiagramItem.createShape({ 
        id: '2',
        renderer: 'Button',
        transform: new Transform(
            new Vec2(200, 100),
            new Vec2(100, 50),
            Rotation.ZERO,
        ),
    });

    it('should instantiate with factory method', () => {
        const group = DiagramItem.createGroup({ id: groupId, childIds: [shape1.id, shape2.id] });

        expect(group).toBeDefined();
        expect(group.id).toBeDefined();
        expect(group.childIds.size).toBe(2);
        expect(group.childIds.at(0)).toBe(shape1.id);
        expect(group.childIds.at(1)).toBe(shape2.id);
    });

    it('should return original group when transforming from null old bounds', () => {
        const group_1 = DiagramItem.createGroup({ id: groupId });
        const group_2 = group_1.transformByBounds(null!, transform);

        expect(group_2).toBe(group_1);
    });

    it('should return original group when transforming to null new bounds', () => {
        const group_1 = DiagramItem.createGroup({ id: groupId });
        const group_2 = group_1.transformByBounds(transform, null!);

        expect(group_2).toBe(group_1);
    });

    it('should return original group when transforming between equal bounds', () => {
        const group_1 = DiagramItem.createGroup({ id: groupId });
        const group_2 = group_1.transformByBounds(transform, transform);

        expect(group_2).toBe(group_1);
    });

    it('should update roration when transforming between bounds', () => {
        const boundsNew = new Transform(Vec2.ZERO, Vec2.ZERO, Rotation.fromDegree(90));
        const boundsOld = new Transform(Vec2.ZERO, Vec2.ZERO, Rotation.fromDegree(215));

        const group_1 = DiagramItem.createGroup({ id: groupId });
        const group_2 = group_1.transformByBounds(boundsNew, boundsOld);

        const actual = group_2.rotation;
        const expected = Rotation.fromDegree(125);

        expect(actual).toEqual(expected);
    });

    it('should create zero bounds if child id is not in diagram', () => {
        const diagram = Diagram.create({ id: groupId });

        const group = DiagramItem.createGroup({ id: groupId, childIds: ['invalid'] });

        const actual = group.bounds(diagram);
        const expected = Transform.ZERO;

        expect(actual).toEqual(expected);
    });

    it('should calculate bounds from children', () => {
        let diagram =
            Diagram.create({ id: '1' })
                .addShape(shape1)
                .addShape(shape2);

        diagram = diagram.group(groupId, [shape1.id, shape2.id]);

        const group = diagram.items.get(groupId)!;

        const actual = group.bounds(diagram);
        const expected = new Transform(new Vec2(150, 100), new Vec2(200, 50), Rotation.ZERO);

        expect(actual).toEqual(expected);
    });

    it('should cache calculate bounds', () => {
        let diagram =
            Diagram.create({ id: '1' })
                .addShape(shape1)
                .addShape(shape2);

        diagram = diagram.group(groupId, [shape1.id, shape2.id]);

        const group = diagram.items.get(groupId)!;

        const actual1 = group.bounds(diagram);
        const actual2 = group.bounds(diagram);
        const expected = new Transform(new Vec2(150, 100), new Vec2(200, 50), Rotation.ZERO);

        expect(actual1).toEqual(expected);
        expect(actual2).toEqual(expected);
    });
});
