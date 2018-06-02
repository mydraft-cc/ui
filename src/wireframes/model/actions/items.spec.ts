import { Rotation, Vec2 } from '@app/core';

import {
    addIcon,
    addImage,
    addVisual,
    calculateSelection,
    Diagram,
    DiagramItemSet,
    DiagramShape,
    EditorState,
    items,
    pasteItems,
    removeItems,
    RendererService,
    selectItems,
    Serializer,
    Transform
} from '@app/wireframes/model';

import { Button }   from '@app/wireframes/shapes/neutral/button';
import { Icon }     from '@app/wireframes/shapes/shared/icon';
import { Raster }   from '@app/wireframes/shapes/shared/raster';

describe('ItemsReducer', () => {
    const groupId = 'group1';
    const shape1 = DiagramShape.createShape('Button', 100, 100);
    const shape2 = DiagramShape.createShape('Button', 100, 100);
    const shape3 = DiagramShape.createShape('Button', 100, 100);

    let diagram =
        Diagram.empty()
            .addVisual(shape1)
            .addVisual(shape2)
            .addVisual(shape3);
    diagram = diagram.group([shape1.id, shape2.id], groupId);

    const rendererService
        = new RendererService()
            .addRenderer(new Icon())
            .addRenderer(new Button())
            .addRenderer(new Raster());

    const reducer = items(rendererService, new Serializer(rendererService));

    it('should return same state if action is unknown', () => {
        const action = { type: 'UNKNOWN' };
        const state_1 = EditorState.empty();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should select shapes and set the ids of these shapes', () => {
        const action = selectItems(diagram, [groupId]);
        const state_1 = EditorState.empty().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        expect(state_2.diagrams.last.selectedItemIds.toArray()).toEqual([groupId]);
    });

    it('should remove items and all children', () => {
        const action = removeItems(diagram, [diagram.items.get(groupId)!]);
        const state_1 = EditorState.empty().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        expect(state_2.diagrams.last.items.size).toBe(1);
    });

    it('should add icon to diagram and select the shape', () => {
        const shapeId = 'shape';

        const action = addIcon(diagram, 'Icon', 20, 40, shapeId);
        const state_1 = EditorState.empty().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newIcon = <DiagramShape>state_2.diagrams.last.items.get(shapeId);

        expect(newIcon.id).toBe(shapeId);
        expect(newIcon.appearance.get('TEXT')).toBe('Icon');
        expect(newIcon.renderer).toBe('Icon');
        expect(newIcon.transform).toEqual(new Transform(new Vec2(40, 60), new Vec2(40, 40), Rotation.ZERO));

        expect(state_2.diagrams.last.selectedItemIds.toArray()).toEqual([shapeId]);
    });

    it('should add raster to diagram and select the shape', () => {
        const shapeId = 'shape';

        const action = addImage(diagram, 'source', 20, 40, 60, 80, shapeId);
        const state_1 = EditorState.empty().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newImage = <DiagramShape>state_2.diagrams.last.items.get(shapeId);

        expect(newImage.id).toBe(shapeId);
        expect(newImage.appearance.get('SOURCE')).toBe('source');
        expect(newImage.renderer).toBe('Raster');
        expect(newImage.transform).toEqual(new Transform(new Vec2(50, 80), new Vec2(60, 80), Rotation.ZERO));

        expect(state_2.diagrams.last.selectedItemIds.toArray()).toEqual([shapeId]);
    });

    it('should add raster and resize to max height of 300 if height is larger', () => {
        const shapeId = 'shape';

        const action = addImage(diagram, 'source', 20, 40, 600, 800, shapeId);
        const state_1 = EditorState.empty().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newImage = <DiagramShape>state_2.diagrams.last.items.get(shapeId);

        expect(newImage.transform.size).toEqual(new Vec2(225, 300));
    });

    it('should add raster and resize to max width of 300 if width is larger', () => {
        const shapeId = 'shape';

        const action = addImage(diagram, 'source', 20, 40, 600, 300, shapeId);
        const state_1 = EditorState.empty().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newImage = <DiagramShape>state_2.diagrams.last.items.get(shapeId);

        expect(newImage.transform.size).toEqual(new Vec2(300, 150));
    });

    it('should add visual and select this visual', () => {
        const shapeId = 'shape';

        const action = addVisual(diagram, 'Button', 100, 20, shapeId);
        const state_1 = EditorState.empty().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newShape = <DiagramShape>state_2.diagrams.last.items.get(shapeId);

        expect(newShape.id).toBe(shapeId);
        expect(newShape.transform.position).toEqual(new Vec2(150, 35));

        expect(state_2.diagrams.last.selectedItemIds.toArray()).toEqual([shapeId]);
    });

    it('should paste json and add group and items', () => {
        const serializer = new Serializer(rendererService);

        const json = serializer.serializeSet(DiagramItemSet.createFromDiagram(diagram.rootIds.toArray(), diagram)!);

        const action = pasteItems(diagram, json);
        const state_1 = EditorState.empty().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newDiagram = state_2.diagrams.last;

        expect(newDiagram.items.size).toBe(8);
        expect(newDiagram.rootIds.size).toBe(4);
        expect(newDiagram.selectedItemIds.size).toBe(2);
    });

    it('should not throw when pasting invalid json to diagram', () => {
        const json = 'invalid json';

        const action = pasteItems(diagram, json);
        const state = EditorState.empty();

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

    it('should Select grouped shape when group is selected', () => {
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