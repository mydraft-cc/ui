import { MathHelper, Vec2 } from '@app/core'

import { Checkbox } from './../shapes/checkbox';

import {
    Diagram,
    DiagramItemSet,
    DiagramShape,
    DiagramVisual,
    Serializer,
    RendererService,
    Transform
} from '@app/wireframes/model';

class CustomVisual extends DiagramVisual {
    public bounds(): Transform {
        throw new Error('Not supported');
    }

    public transformByBounds(): DiagramVisual {
        throw new Error('Not supported');
    }

    public clone(): DiagramVisual {
        throw new Error('Not supported');
    }
}

describe('Serializer', () => {
    const checkbox = new Checkbox();

    const oldShape1 = checkbox.createDefaultShape('id1').transformWith(t => t.moveTo(new Vec2(100, 20)));
    const oldShape2 = checkbox.createDefaultShape('id2').transformWith(t => t.moveTo(new Vec2(30, 10)));

    let renderers: RendererService;

    beforeEach(() => {
        renderers = new RendererService();
        renderers.addRenderer(checkbox);
    });

    it('should serialize and deserialize', () => {
        const serializer = new Serializer(renderers);
        const groupId = MathHelper.guid();

        let oldDiagram =
            Diagram.createDiagram()
                .addVisual(oldShape1)
                .addVisual(oldShape2)
                .addVisual(new CustomVisual(MathHelper.guid(), null!))
                .group([oldShape1.id, oldShape2.id], groupId);

        const oldSet = DiagramItemSet.createFromDiagram([oldDiagram.items.last.id], oldDiagram) !;

        const json = serializer.serializeSet(oldSet);

        const newSet = serializer.deserializeSet(json);
        const newShape1 = <DiagramShape>newSet.allVisuals[0];
        const newShape2 = <DiagramShape>newSet.allVisuals[1];

        expect(newSet).toBeDefined();
        expect(newSet.allVisuals.length).toBe(2);

        compareShapes(newShape1, oldShape1);
        compareShapes(newShape2, oldShape2);

        const group = newSet.allGroups[0];

        expect(group.childIds.get(0)).toBe(newShape1.id);
        expect(group.childIds.get(1)).toBe(newShape2.id);
    });

    function compareShapes(newShape: DiagramShape, originalShape: DiagramShape) {
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