/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Vec2 } from '@app/core';
import { Diagram, DiagramItem, DiagramItemSet, RendererService, Serializer } from '@app/wireframes/model';
import { Checkbox } from '@app/wireframes/shapes/neutral/checkbox';
import { AbstractControl } from '../shapes/utils/abstract-control';

describe('Serializer', () => {
    const checkbox = new AbstractControl(new Checkbox());

    const oldShape1 = DiagramItem.createShape(checkbox.createDefaultShape()).transformWith(t => t.moveTo(new Vec2(100, 20)));
    const oldShape2 = DiagramItem.createShape(checkbox.createDefaultShape()).transformWith(t => t.moveTo(new Vec2(100, 20)));
    const oldShape3 = DiagramItem.createShape({ renderer: null! });

    let renderers: RendererService;

    beforeEach(() => {
        renderers = new RendererService();
        renderers.addRenderer(checkbox);
    });

    it('should serialize and deserialize set', () => {
        const serializer = new Serializer(renderers);

        const groupId = 'group-1';

        const oldDiagram =
            Diagram.create({ id: '1' })
                .addShape(oldShape1)
                .addShape(oldShape2)
                .addShape(oldShape3)
                .group(groupId, [oldShape1.id, oldShape2.id]);

        const oldSet = DiagramItemSet.createFromDiagram([oldDiagram.items.get(groupId)!], oldDiagram) !;

        const newSet = serializer.deserializeSet(serializer.serializeSet(oldSet), false);

        expect(newSet).toBeDefined();

        const newShape1 = newSet.allShapes[0];
        const newShape2 = newSet.allShapes[1];

        expect(newSet.allShapes.length).toBe(2);

        compareShapes(newShape1, oldShape1);
        compareShapes(newShape2, oldShape2);

        const group = newSet.allGroups[0];

        expect(group.childIds.at(0)).toBe(newShape1.id);
        expect(group.childIds.at(1)).toBe(newShape2.id);
    });

    function compareShapes(newShape: DiagramItem, originalShape: DiagramItem) {
        expect(newShape.appearance.size).toBe(originalShape.appearance.size);
        expect(newShape.configurables?.length).toBe(originalShape.configurables?.length);
        expect(newShape.renderer).toBe(originalShape.renderer);
        expect(newShape.transform.position.x).toBe(originalShape.transform.position.x);
        expect(newShape.transform.position.y).toBe(originalShape.transform.position.y);
        expect(newShape.transform.size.x).toBe(originalShape.transform.size.x);
        expect(newShape.transform.size.y).toBe(originalShape.transform.size.y);
    }
});
