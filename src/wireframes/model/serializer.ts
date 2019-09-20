import {
    ImmutableMap,
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
        const allShapes: DiagramItem[] = [];
        const allGroups: DiagramItem[] = [];

        const input = JSON.parse(json);

        for (const jsonShape of input.visuals) {
            const shape = this.deserializeShape(jsonShape);

            if (shape) {
                allShapes.push(shape);
            }
        }

        for (const jsonGroup of input.groups) {
            const group = Serializer.deserializeGroup(jsonGroup);

            allGroups.push(group);
        }

        return new DiagramItemSet(allGroups, allShapes);
    }

    public serializeSet(set: DiagramItemSet) {
        const output: any = { visuals: [], groups: [] };

        for (let visual of set.allVisuals) {
            const json = Serializer.serializeShape(visual);

            output.visuals.push(json);
        }

        for (let group of set.allGroups) {
            const json = Serializer.serializeGroup(group);

            output.groups.push(json);
        }

        return JSON.stringify(output);
    }

    private static deserializeGroup(input: any) {
        return DiagramItem.createGroup(input.id,
            deserializeChildIds(input),
            deserializeRotation(input));
    }

    private static serializeGroup(group: DiagramItem) {
        const output = { id: group.id };

        serializeChildIds(group.childIds, output);
        serializeRotation(group.rotation, output);

        return output;
    }

    private deserializeShape(input: any) {
        const rendererId = deserializeRenderer(input);

        const renderer = this.rendererService.registeredRenderers[rendererId];

        if (!renderer) {
            return null;
        }

        const transform = deserializeTransform(input);

        const shape =
            renderer.createDefaultShape(input.id)
                .merge({ appearance: deserializeAppearance(input), transform });

        return shape;
    }

    private static serializeShape(shape: DiagramItem): any {
        const output = { id: shape.id };

        serializeRenderer(shape.renderer, output);
        serializeTransform(shape.transform, output);
        serializeAppearance(shape.appearance, output);

        return output;
    }
}

function serializeChildIds(childIds: DiagramContainer, output: any) {
    output.childIds = childIds.values;
}

function deserializeChildIds(input: any) {
    return DiagramContainer.of(...input.childIds);
}

function serializeRotation(rotation: Rotation, output: any) {
    output.rotation = rotation.degree;
}

function deserializeRotation(input: any) {
    return Rotation.fromDegree(input.rotation);
}

function serializeRenderer(renderer: string, output: any) {
    output.renderer = renderer;
}

function deserializeRenderer(input: any): string {
    return input.renderer;
}

function serializeAppearance(appearance: ImmutableMap<any>, output: any) {
    output.appearance = appearance.toJS();
}

function deserializeAppearance(input: any) {
    return ImmutableMap.of(input.appearance);
}

function serializeTransform(transform: Transform, output: any) {
    output.transform = transform.toJS();
}

function deserializeTransform(input: any) {
    return Transform.fromJS(input.transform);
}