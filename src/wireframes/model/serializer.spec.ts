import { Vec2 } from '@app/core';

import { Checkbox } from '@app/wireframes/shapes/neutral/checkbox';

import {
    Diagram,
    DiagramItem,
    DiagramItemSet,
    RendererService,
    Serializer
} from '@app/wireframes/model';

describe('Serializer', () => {
    const checkbox = new Checkbox();

    const oldShape1 = checkbox.createDefaultShape('1').transformWith(t => t.moveTo(new Vec2(100, 20)));
    const oldShape2 = checkbox.createDefaultShape('2').transformWith(t => t.moveTo(new Vec2(30, 10)));

    let renderers: RendererService;

    beforeEach(() => {
        renderers = new RendererService();
        renderers.addRenderer(checkbox);
    });

    it('should serialize and deserialize', () => {
        const serializer = new Serializer(renderers);

        const groupId = '3';

        let oldDiagram =
            Diagram.empty('1')
                .addVisual(oldShape1)
                .addVisual(oldShape2)
                .addVisual(DiagramItem.createShape('1', 'Custom', 100, 100))
                .group(groupId, [oldShape1.id, oldShape2.id]);

        const oldSet = DiagramItemSet.createFromDiagram([oldDiagram.items.last()], oldDiagram) !;

        const json = serializer.serializeSet(oldSet);

        const newSet = serializer.deserializeSet(serializer.generateNewIds(json));
        const newShape1 = <DiagramItem>newSet.allVisuals[0];
        const newShape2 = <DiagramItem>newSet.allVisuals[1];

        expect(newSet).toBeDefined();
        expect(newSet.allVisuals.length).toBe(2);

        compareShapes(newShape1, oldShape1);
        compareShapes(newShape2, oldShape2);

        const group = newSet.allGroups[0];

        expect(group.childIds.at(0)).toBe(newShape1.id);
        expect(group.childIds.at(1)).toBe(newShape2.id);
    });

    function compareShapes(newShape: DiagramItem, originalShape: DiagramItem) {
        expect(newShape.renderer).toBe(originalShape.renderer);
        expect(newShape.configurables.length).toBe(originalShape.configurables.length);
        expect(newShape.transform.position.x).toBe(originalShape.transform.position.x);
        expect(newShape.transform.position.y).toBe(originalShape.transform.position.y);
        expect(newShape.transform.size.x).toBe(originalShape.transform.size.x);
        expect(newShape.transform.size.y).toBe(originalShape.transform.size.y);
        expect(newShape.appearance.size).toBe(originalShape.appearance.size);
        expect(newShape.id).not.toBe(originalShape.id);
    }
});