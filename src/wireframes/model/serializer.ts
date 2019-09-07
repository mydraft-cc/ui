import * as Immutable from 'immutable';

import {
    ImmutableList,
    MathHelper,
    Rotation
} from '@app/core';

import { DiagramGroup } from './diagram-group';
import { DiagramItemSet } from './diagram-item-set';
import { DiagramShape } from './diagram-shape';
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
        const s: DiagramShape[] = [];
        const g: DiagramGroup[] = [];

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
            const json = Serializer.serializeShape(visual as DiagramShape);

            output.visuals.push(json);
        }

        for (let group of set.allGroups) {
            const json = Serializer.serializeGroup(group);

            output.groups.push(json);
        }

        return JSON.stringify(output);
    }

    private static deserializeGroup(input: any): DiagramGroup {
        return DiagramGroup.createGroup(input.id,
            Serializer.deserializeChildIds(input),
            Serializer.deserializeRotation(input));
    }

    private static serializeGroup(group: DiagramGroup) {
        const output = { id: group.id };

        Serializer.serializeChildIds(group.childIds, output);
        Serializer.serializeRotation(group.rotation, output);

        return output;
    }

    private deserializeShape(input: any): DiagramShape {
        const renderer = Serializer.deserializeRenderer(input);

        let shape = this.rendererService.registeredRenderers[renderer].createDefaultShape(input.id);

        shape = Serializer.deserializeAppearance(shape, input);
        shape = Serializer.deserializeTransform(shape, input);

        return shape;
    }

    private static serializeShape(shape: DiagramShape): any {
        const output = { id: shape.id };

        Serializer.serializeRenderer(shape.renderer, output);
        Serializer.serializeTransform(shape.transform, output);
        Serializer.serializeAppearance(shape.appearance, output);

        return output;
    }

    private static serializeChildIds(childIds: ImmutableList<string>, output: any) {
        output.childIds = childIds.toArray();
    }

    private static deserializeChildIds(input: any): ImmutableList<string> {
        return ImmutableList.of(...input.childIds);
    }

    private static serializeRotation(rotation: Rotation, output: any) {
        output.rotation = rotation.degree;
    }

    private static deserializeRotation(input: any): Rotation {
        return Rotation.fromDegree(input.rotation);
    }

    private static serializeRenderer(renderer: string, output: any) {
        output.renderer = renderer;
    }

    private static deserializeRenderer(input: any): string {
        return input.renderer;
    }

    private static serializeAppearance(appearance: Immutable.Map<string, any>, output: any) {
        output.appearance = appearance.toJS();
    }

    private static deserializeAppearance(shape: DiagramShape, input: any): DiagramShape {
        return shape.replaceAppearance(shape.appearance.merge(Immutable.Map<string, any>(input.appearance))) as DiagramShape;
    }

    private static serializeTransform(transform: Transform, output: any) {
        output.transform = transform.toJS();
    }

    private static deserializeTransform(shape: DiagramShape, input: any): DiagramShape {
        return shape.transformTo(Transform.fromJS(input.transform));
    }
}