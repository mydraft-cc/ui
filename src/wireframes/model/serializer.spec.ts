/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Vec2 } from '@app/core';
import { Diagram, DiagramItem, DiagramItemSet, EditorState, RendererService, Serializer } from '@app/wireframes/model';
import { Checkbox } from '@app/wireframes/shapes/neutral/checkbox';
import { AbstractControl } from '../shapes/utils/abstract-control';

describe('Serializer', () => {
    const checkbox = new AbstractControl(new Checkbox());

    const groupId = 'group-1';
    const oldShape1 = DiagramItem.createShape(checkbox.createDefaultShape()).transformWith(t => t.moveTo(new Vec2(100, 20)));
    const oldShape2 = DiagramItem.createShape(checkbox.createDefaultShape()).transformWith(t => t.moveTo(new Vec2(100, 20)));
    const brokenShape = DiagramItem.createShape({ renderer: null! });

    beforeEach(() => {
        RendererService.addRenderer(checkbox);
    });

    it('should serialize and deserialize set', () => {
        const original =
            DiagramItemSet.createFromDiagram([groupId],
                createDiagram('1'));

        const newValue = Serializer.deserializeSet(Serializer.serializeSet(original));

        compareSets(newValue, original);
    });

    it('should serialize and deserialize set when set has no types', () => {
        const original =
            DiagramItemSet.createFromDiagram([groupId],
                createDiagram('1'));

        const serialized = Serializer.serializeSet(original);

        for (const visual of serialized.visuals) {
            delete visual.type;
        }

        for (const group of serialized.groups) {
            delete group.type;
        }

        const newValue = Serializer.deserializeSet(serialized);

        compareSets(newValue, original);
    });

    it('should not deserialize broken shape into set', () => {
        const original =
            DiagramItemSet.createFromDiagram([groupId],
                createDiagram('1').addShape(brokenShape));

        const newValue = Serializer.deserializeSet(Serializer.serializeSet(original));

        expect(newValue.allItems.length).toEqual(3);
    });

    it('should serialize and deserialize editor', () => {
        const original =
            EditorState.create()
                .addDiagram(createDiagram('1'))
                .addDiagram(createDiagram('2'));

        const newValue = Serializer.deserializeEditor(Serializer.serializeEditor(original));

        compareEditors(newValue, original);
    });

    it('should deserialize broken shape into editor editor', () => {
        const original =
            EditorState.create()
                .addDiagram(createDiagram('1').addShape(brokenShape))
                .addDiagram(createDiagram('2'));

        const newValue = Serializer.deserializeEditor(Serializer.serializeEditor(original));

        expect(newValue.diagrams.values[0].items.size).toEqual(3);
    });

    function createDiagram(id: string) {
        const diagram =
            Diagram.create({ id })
                .addShape(oldShape1)
                .addShape(oldShape2)
                .group(groupId, [oldShape1.id, oldShape2.id]);

        return diagram;
    }

    function compareEditors(newValue: EditorState | undefined, original: EditorState) {
        expect(newValue).toBeDefined();
        expect(newValue?.diagrams.size).toEqual(original.diagrams.size);

        for (const item of original.diagrams.values) {
            compareDiagrams(newValue?.diagrams.get(item.id), item);
        }
    }

    function compareDiagrams(newValue: Diagram | undefined, original: Diagram) {
        expect(newValue).toBeDefined();
        expect(newValue?.items.size).toEqual(original.items.size);

        for (const item of original.items.values) {
            compareShapes(newValue?.items.get(item.id), item);
        }
    }

    function compareSets(newValue: DiagramItemSet | undefined, original: DiagramItemSet) {
        expect(newValue).toBeDefined();
        expect(newValue?.allItems.length).toEqual(original.allItems.length);

        for (const item of original.allItems) {
            compareShapes(newValue?.allItems.find(x => x.id === item.id), item);
        }
    }

    function compareShapes(newShape: DiagramItem | undefined, original: DiagramItem) {
        expect(newShape).toBeDefined();
        expect(newShape?.type).toEqual(original.type);

        if (original.type === 'Group') {
            expect(newShape?.childIds.equals(original.childIds)).toBeTrue();
            expect(newShape?.rotation.equals(original.rotation)).toBeTrue();
        } else {
            expect(newShape?.appearance.size).toBe(original.appearance.size);
            expect(newShape?.configurables?.length).toBe(original.configurables?.length);
            expect(newShape?.renderer).toBe(original.renderer);
            expect(newShape?.transform.equals(original.transform)).toBeTrue();
        }
    }
});
