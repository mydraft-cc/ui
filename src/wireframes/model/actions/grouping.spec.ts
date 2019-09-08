import {
    Diagram,
    DiagramItem,
    EditorState,
    grouping,
    groupItems,
    ungroupItems
} from '@app/wireframes/model';

describe('GroupingReducer', () => {
    const reducer = grouping();

    it('should return same state if action is unknown', () => {
        const action = { type: 'UNKNOWN' };

        const state_1 = EditorState.empty();
        const state_2 = reducer(state_1, action);

        expect(state_2).toBe(state_1);
    });

    it('should group shapes and select new group', () => {
        const id1 = '1';
        const id2 = '2';

        const diagram =
            Diagram.empty('1')
                .addVisual(DiagramItem.createShape(id1, 'btn', 100, 100))
                .addVisual(DiagramItem.createShape(id2, 'btn', 100, 100));

        const groupId = 'group-1';

        const action = groupItems(diagram, diagram.items.values, groupId);

        const state_1 = EditorState.empty().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newDiagram = state_2.diagrams.get(diagram.id);

        expect(newDiagram.selectedIds.values).toEqual([groupId]);
        expect(newDiagram.rootIds.values).toEqual([groupId]);
    });

    it('should ungroup multiple groups and select their children', () => {
        const groupId1 = 'group-1';
        const groupId2 = 'group-2';

        const id1 = '1';
        const id2 = '2';
        const id3 = '3';
        const id4 = '4';

        let diagram =
            Diagram.empty('1')
                .addVisual(DiagramItem.createShape(id1, 'btn', 100, 100))
                .addVisual(DiagramItem.createShape(id2, 'btn', 100, 100))
                .addVisual(DiagramItem.createShape(id3, 'btn', 100, 100))
                .addVisual(DiagramItem.createShape(id4, 'btn', 100, 100));

        const shapes = diagram.items;

        diagram = diagram.group(groupId1, [id1, id2]);
        diagram = diagram.group(groupId2, [id3, id4]);

        const group1 = diagram.items.get(groupId1);
        const group2 = diagram.items.get(groupId2);

        const action = ungroupItems(diagram, [group1, group2, DiagramItem.createGroup('5', [])]);

        const state_1 = EditorState.empty().addDiagram(diagram);
        const state_2 = reducer(state_1, action);

        const newDiagram = state_2.diagrams.get(diagram.id);

        const ids = shapes.keys;

        expect(newDiagram.selectedIds.values).toEqual(ids);
        expect(newDiagram.rootIds.values).toEqual(ids);
    });
});