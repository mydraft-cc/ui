/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/naming-convention */

import { Vec2 } from '@app/core/utils';
import { addShape, buildItems, calculateSelection, createClassReducer, Diagram, DiagramItem, DiagramItemSet, EditorState, lockItems, pasteItems, removeItems, renameItems, RendererService, selectItems, Serializer, unlockItems } from '@app/wireframes/model';
import { Button } from '@app/wireframes/shapes/neutral/button';
import { Icon } from '@app/wireframes/shapes/shared/icon';
import { Raster } from '@app/wireframes/shapes/shared/raster';
import { AbstractControl } from '@app/wireframes/shapes/utils/abstract-control';

describe('ItemsReducer', () => {
    const groupId = 'group-1';
    const shape1 = DiagramItem.createShape({ id: '1', renderer: 'Button' });
    const shape2 = DiagramItem.createShape({ id: '2', renderer: 'Button' });
    const shape3 = DiagramItem.createShape({ id: '3', renderer: 'Button' });

    let diagram =
        Diagram.create({ id: '1' })
            .addShape(shape1)
            .addShape(shape2.lock())
            .addShape(shape3);
    diagram = diagram.group(groupId, [shape1.id, shape2.id]);

    RendererService.addRenderer(new AbstractControl(new Icon()));
    RendererService.addRenderer(new AbstractControl(new Button()));
    RendererService.addRenderer(new AbstractControl(new Raster()));

    const state =
        EditorState.create()
            .addDiagram(diagram);

    const reducer = createClassReducer(state, builder => buildItems(builder));

    it('should return same state if action is unknown', () => {
        const action = { type: 'UNKNOWN' };

        const state_1 = EditorState.create();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should select shapes and set the ids of these shapes', () => {
        const action = selectItems(diagram, [groupId]);

        const state_1 = EditorState.create().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newDiagram = state_2.diagrams.get(diagram.id)!;

        expect(newDiagram.selectedIds.values).toEqual([groupId]);
    });

    it('should remove items and all children', () => {
        const action = removeItems(diagram, [diagram.items.get(groupId)!]);

        const state_1 = EditorState.create().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newDiagram = state_2.diagrams.get(diagram.id)!;

        expect(newDiagram.selectedIds.size).toBe(0);
    });

    it('should rename item', () => {
        const action = renameItems(diagram, [shape1], 'Name');

        const state_1 = EditorState.create().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newShape = state_2.diagrams.get(diagram.id)!.items.get(shape1.id)!;

        expect(newShape.name).toEqual('Name');
    });

    it('should lock item', () => {
        const action = lockItems(diagram, [shape1]);

        const state_1 = EditorState.create().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newShape = state_2.diagrams.get(diagram.id)!.items.get(shape1.id)!;

        expect(newShape.isLocked).toBeTruthy();
    });

    it('should unlock item', () => {
        const action = unlockItems(diagram, [shape2]);

        const state_1 = EditorState.create().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newShape = state_2.diagrams.get(diagram.id)!.items.get(shape2.id)!;

        expect(newShape.isLocked).toBeFalsy();
    });

    it('should add shape and select this shape', () => {
        const shapeId = 'shape';

        const action = addShape(diagram, 'Button', { position: { x: 100, y: 20 } }, shapeId);

        const state_1 = EditorState.create().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newDiagram = state_2.diagrams.get(diagram.id)!;
        const newShape = newDiagram.items.get(shapeId)!;

        expect(newShape.id).toBe(shapeId);
        expect(newShape.transform.position).toEqual(new Vec2(150, 35));
        expect(newDiagram.selectedIds.values).toEqual([shapeId]);
    });

    it('should add shape with default properties and select this shape', () => {
        const shapeId = 'shape';

        const action = addShape(diagram, 'Button', { position: { x: 100, y: 20 }, appearance: { text1: 'text1', text2: 'text2' } }, shapeId);

        const state_1 = EditorState.create().addDiagram(diagram)!;
        const state_2 = reducer(state_1, action);

        const newDiagram = state_2.diagrams.get(diagram.id)!;
        const newShape = newDiagram.items.get(shapeId)!;

        expect(newShape.id).toBe(shapeId);
        expect(newShape.appearance.get('text1')).toEqual('text1');
        expect(newShape.appearance.get('text2')).toEqual('text2');
        expect(newShape.transform.position).toEqual(new Vec2(150, 35));
        expect(newDiagram.selectedIds.values).toEqual([shapeId]);
    });

    it('should paste json and add group and items', () => {
        let source: any = DiagramItemSet.createFromDiagram(diagram.rootIds.values, diagram)!;
        source = Serializer.serializeSet(source);
        source = JSON.stringify(source);

        const action1 = pasteItems(diagram, source);
        const action2 = pasteItems(diagram, source);

        const state_1 = EditorState.create().addDiagram(diagram);
        const state_2 = reducer(state_1, action1);
        const state_3 = reducer(state_2, action2);

        const newDiagram1 = state_2.diagrams.get(diagram.id)!;
        const newDiagram2 = state_3.diagrams.get(diagram.id)!;

        expect(newDiagram1.items.size).toBe(8);
        expect(newDiagram1.rootIds.size).toBe(4);
        expect(newDiagram1.selectedIds.size).toBe(2);

        expect(newDiagram2.items.size).toBe(12);
        expect(newDiagram2.rootIds.size).toBe(6);
        expect(newDiagram2.selectedIds.size).toBe(2);
    });

    it('should not throw when pasting invalid json to diagram', () => {
        const json = 'invalid json';

        const action = pasteItems(diagram, json);
        const state = EditorState.create();

        expect(() => reducer(state, action)).not.toThrow();
    });

    it('should return empty array of items when items array is null', () => {
        const itemIds = calculateSelection(null!, diagram);

        expect(itemIds).toEqual([]);
    });

    it('should return empty array of item ids when selecting invalid items', () => {
        const itemIds = calculateSelection([null!], diagram, true);

        expect(itemIds).toEqual([]);
    });

    it('should not handle grouped shapes when shape is not in group', () => {
        const itemIds = calculateSelection([diagram.items.get(groupId)!], diagram, true);

        expect(itemIds).toEqual([groupId]);
    });

    it('should return group id when selecting grouped items', () => {
        const itemIds = calculateSelection([shape1, shape2], diagram);

        expect(itemIds).toEqual([groupId]);
    });

    it('should select grouped shape when group is selected', () => {
        const selectedDiagram = diagram.selectItems([groupId]);

        const itemIds = calculateSelection([shape1], selectedDiagram, true);

        expect(itemIds).toEqual([shape1.id]);
    });

    it('should add item to selection list', () => {
        const selectedDiagram = diagram.selectItems([groupId]);

        const itemIds = calculateSelection([shape3], selectedDiagram, true, true);

        expect(itemIds).toEqual([groupId, shape3.id]);
    });

    it('should remove item from selection list', () => {
        const selectedDiagram = diagram.selectItems([groupId, shape3.id]);

        const itemIds = calculateSelection([shape3], selectedDiagram, true, true);

        expect(itemIds).toEqual([groupId]);
    });
});
