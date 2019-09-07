import { Map } from 'immutable';

import {
    MathHelper,
    Rotation
} from '@app/core';

import { DiagramContainer } from './diagram-container';
import { DiagramItem } from './diagram-item';
import { DiagramItemSet } from './diagram-item-set';
import { RendererService } from './renderer.service';
import { Transform } from './transform';

type IdMap = { [id: string]: string };

export class Serializer {
    constructor(
        private readonly rendererService: RendererService
    ) {
    }

    public generateNewIds(json: string): string {
        const input = JSON.parse(json);

        const idMap: IdMap = {};

        for (const jsonShape of input.visuals) {
            const oldId = jsonShape.id;

            jsonShape.id = MathHelper.guid();

            idMap[oldId] = jsonShape.id;
        }

        for (const jsonGroup of input.groups) {
            const oldId = jsonGroup.id;

            jsonGroup.id = MathHelper.guid();

            idMap[oldId] = jsonGroup.id;
        }

        for (const jsonGroup of input.groups) {
            jsonGroup.childIds = jsonGroup.childIds.map((id: string) => idMap[id]);
        }

        return JSON.stringify(input);
    }

    public deserializeSet(json: string): DiagramItemSet {
        const s: DiagramItem[] = [];
        const g: DiagramItem[] = [];

        const input = JSON.parse(json);

        for (const jsonShape of input.visuals) {
            const shape = this.deserializeShape(jsonShape);

            s.push(shape);
        }

        for (const jsonGroup of input.groups) {
            const group = Serializer.deserializeGroup(jsonGroup);

            g.push(group);
        }

        return new DiagramItemSet(g, s);
    }

    public serializeSet(set: DiagramItemSet): string {
        const output: any = { visuals: [], groups: [] };

        for (let visual of set.allVisuals) {
            const json = Serializer.serializeShape(visual as DiagramItem);

            output.visuals.push(json);
        }

        for (let group of set.allGroups) {
            const json = Serializer.serializeGroup(group);

            output.groups.push(json);
        }

        return JSON.stringify(output);
    }

    private static deserializeGroup(input: any): DiagramItem {
        return DiagramItem.createGroup(input.id,
            Serializer.deserializeChildIds(input),
            Serializer.deserializeRotation(input));
    }

    private static serializeGroup(group: DiagramItem) {
        const output = { id: group.id };

        Serializer.serializeChildIds(group.childIds, output);
        Serializer.serializeRotation(group.rotation, output);

        return output;
    }

    private deserializeShape(input: any): DiagramItem {
        const renderer = Serializer.deserializeRenderer(input);

        let shape = this.rendererService.registeredRenderers[renderer].createDefaultShape(input.id);

        shape = Serializer.deserializeAppearance(shape, input);
        shape = Serializer.deserializeTransform(shape, input);

        return shape;
    }

    private static serializeShape(shape: DiagramItem): any {
        const output = { id: shape.id };

        Serializer.serializeRenderer(shape.renderer, output);
        Serializer.serializeTransform(shape.transform, output);
        Serializer.serializeAppearance(shape.appearance, output);

        return output;
    }

    private static serializeChildIds(childIds: DiagramContainer, output: any) {
        output.childIds = childIds.values;
    }

    private static deserializeChildIds(input: any) {
        return DiagramContainer.of(input.childIds);
    }

    private static serializeRotation(rotation: Rotation, output: any) {
        output.rotation = rotation.degree;
    }

    private static deserializeRotation(input: any) {
        return Rotation.fromDegree(input.rotation);
    }

    private static serializeRenderer(renderer: string, output: any) {
        output.renderer = renderer;
    }

    private static deserializeRenderer(input: any): string {
        return input.renderer;
    }

    private static serializeAppearance(appearance: Map<string, any>, output: any) {
        output.appearance = appearance.toJS();
    }

    private static deserializeAppearance(shape: DiagramItem, input: any) {
        return shape.replaceAppearance(shape.appearance.merge(Map<string, any>(input.appearance))) as DiagramItem;
    }

    private static serializeTransform(transform: Transform, output: any) {
        output.transform = transform.toJS();
    }

    private static deserializeTransform(shape: DiagramItem, input: any) {
        return shape.transformTo(Transform.fromJS(input.transform));
    }
}