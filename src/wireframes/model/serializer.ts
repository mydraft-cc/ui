import * as Immutable from 'immutable';

import {
    ImmutableList,
    MathHelper,
    Rotation
} from '@app/core';

import {
    DiagramGroup,
    DiagramItemSet,
    DiagramShape,
    RendererService,
    Transform
} from '@app/wireframes/model';

export class Serializer {
    constructor(
        private readonly rendererService: RendererService
    ) {
    }

    public deserializeSet(json: string): DiagramItemSet {
        const s: DiagramShape[] = [];
        const g: DiagramGroup[] = [];

        const input = JSON.parse(json);

        const idMap: { [id: string]: string } = {};

        for (const jsonShape of input.visuals) {
            idMap[jsonShape.id] = MathHelper.guid();
        }

        for (const jsonGroup of input.groups) {
            idMap[jsonGroup.id] = MathHelper.guid();
        }

        for (const jsonShape of input.visuals) {
            const shape = this.deserializeShape(jsonShape, idMap[jsonShape.id]);

            s.push(shape);
        }

        for (const jsonGroup of input.groups) {
            const group = Serializer.deserializeGroup(jsonGroup, idMap[jsonGroup.id], idMap);

            g.push(group);
        }

        return new DiagramItemSet(g, s);
    }

    public serializeSet(set: DiagramItemSet): string {
        const output: any = { visuals: [], groups: [] };

        for (let visual of set.allVisuals) {
            const shape = <DiagramShape>visual;
            const json = Serializer.serializeShape(shape);

            output.visuals.push(json);
        }

        for (let group of set.allGroups) {
            const json = Serializer.serializeGroup(group);

            output.groups.push(json);
        }

        return JSON.stringify(output);
    }

    private static deserializeGroup(input: any, id: string, idMap: { [id: string]: string }): DiagramGroup {
        return DiagramGroup.createGroup(id,
            Serializer.deserializeChildIds(input, idMap),
            Serializer.deserializeRotation(input));
    }

    private static serializeGroup(group: DiagramGroup) {
        const output = { id: group.id };

        Serializer.serializeChildIds(group.childIds, output);
        Serializer.serializeRotation(group.rotation, output);

        return output;
    }

    private deserializeShape(input: any, id: string): DiagramShape {
        const renderer = Serializer.deserializeRenderer(input);

        let shape = this.rendererService.registeredRenderers[renderer].createDefaultShape(id);

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
        output['childIds'] = childIds.toArray();
    }

    private static deserializeChildIds(input: any, idMap: { [id: string]: string }): ImmutableList<string> {
        return ImmutableList.of(...input['childIds'].map((i: string) => idMap[i]));
    }

    private static serializeRotation(rotation: Rotation, output: any) {
        output['rotation'] = rotation.degree;
    }

    private static deserializeRotation(input: any): Rotation {
        return Rotation.createFromDegree(input['rotation']);
    }

    private static serializeRenderer(renderer: string, output: any) {
        output['renderer'] = renderer;
    }

    private static deserializeRenderer(input: any): string {
        return input['renderer'];
    }

    private static serializeAppearance(appearance: Immutable.Map<string, any>, output: any) {
        output['appearance'] = appearance.toJS();
    }

    private static deserializeAppearance(shape: DiagramShape, input: any): DiagramShape {
        return shape.replaceAppearance(shape.appearance.merge(Immutable.Map<string, any>(input['appearance']))) as DiagramShape;
    }

    private static serializeTransform(transform: Transform, output: any) {
        output['transform'] = transform.toJS();
    }

    private static deserializeTransform(shape: DiagramShape, input: any): DiagramShape {
        return shape.transformTo(Transform.createFromJS(input['transform']));
    }
}