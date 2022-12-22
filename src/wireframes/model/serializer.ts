/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ImmutableList, ImmutableMap, MathHelper, Rotation, Vec2 } from '@app/core';
import { Diagram } from './diagram';
import { DiagramItem } from './diagram-item';
import { DiagramItemSet } from './diagram-item-set';
import { EditorState } from './editor-state';
import { RendererService } from './renderer.service';
import { Transform } from './transform';

type IdMap = { [id: string]: string };

export module Serializer {
    export function deserializeSet(input: any, assignNewIds = false): DiagramItemSet {
        const allItems: DiagramItem[] = [];

        const context = createContext(assignNewIds);

        for (const inputVisual of input.visuals) {
            const item = readDiagramItem(inputVisual, context);

            if (item) {
                allItems.push(item);
            }
        }

        for (const inputGroup of input.groups) {
            const item = readDiagramItem(inputGroup, context);

            if (item) {
                allItems.push(item);
            }
        }

        return new DiagramItemSet(allItems);
    }

    export function serializeSet(set: DiagramItemSet) {
        const output: any = { visuals: [], groups: [] };

        for (const item of Object.values(set.allItems)) {
            const serialized = writeDiagramItem(item);

            if (item.type === 'Shape') {
                output.visuals.push(serialized);
            } else {
                output.groups.push(serialized);
            }
        }

        return output;
    }

    export function deserializeEditor(input: any) {
        const context = createContext();

        return readEditor(input, context);
    }

    export function serializeEditor(editor: EditorState) {
        const output = writeEditor(editor);

        return output;
    }

    function createContext(assignNewIds = false) {
        const context: SerializerContext = { idMap: (id: string) => id };

        if (assignNewIds) {
            const idMap: IdMap = {};

            context.idMap = id => {
                let existing = idMap[id];

                if (!existing) {
                    existing = MathHelper.nextId();

                    idMap[id] = existing;
                }

                return existing;
            };
        }
        return context;
    }
}

function writeEditor(source: EditorState) {
    return writeObject(source.unsafeValues(), EDITOR_SERIALIZERS);
}

function writeDiagram(source: Diagram) {
    return writeObject(source.unsafeValues(), DIAGRAM_SERIALIZERS);
}

function writeDiagramItem(source: DiagramItem) {
    return writeObject(source.unsafeValues(), DIAGRAM_ITEM_SERIALIZERS);
}

function writeObject(source: object, serializers: PropertySerializers) {
    const result = {};

    for (const [key, value] of Object.entries(source)) {
        const serializer = serializers[key];

        if (serializer) {
            result[key] = serializer.get(value);
        }
    }

    return result;
}

function readEditor(source: object, context: SerializerContext) {
    const raw: any = readObject(source, EDITOR_SERIALIZERS, context);

    return EditorState.create(raw);
}

function readDiagram(source: object, context: SerializerContext) {
    const raw: any = readObject(source, DIAGRAM_SERIALIZERS, context);

    return Diagram.create(raw);
}

function readDiagramItem(source: object, context: SerializerContext) {
    const raw: any = readObject(source, DIAGRAM_ITEM_SERIALIZERS, context);

    if (raw.type === 'Shape') {
        const defaults = RendererService.get(raw.renderer!)?.createDefaultShape();

        if (!defaults) {
            return null;
        }

        return DiagramItem.createShape({ ...defaults, ...raw });
    } else {
        return DiagramItem.createGroup(raw);
    }
}

function readObject(source: object, serializers: PropertySerializers, context: SerializerContext) {
    const result = {};

    for (const [key, value] of Object.entries(source)) {
        const serializer = serializers[key];

        if (serializer) {
            result[key] = serializer.set(value, context);
        }
    }

    return result;
}

interface SerializerContext {
    idMap: (id: string) => string;
}

interface PropertySerializer {
    get(source: any): any;
    
    set(source: any, context: SerializerContext): any;
}

type PropertySerializers = { [key: string]: PropertySerializer };

const EDITOR_SERIALIZERS: PropertySerializers = {
    'id': {
        get: (source) => source,
        set: (source, ctx) => ctx.idMap(source),
    },
    'diagrams': {
        get: (source: ImmutableMap<Diagram>) => source.values.map(writeDiagram),
        set: (source: any[], context) => buildObject(source.map(x => readDiagram(x, context)), x => x.id),
    },
    'diagramIds': {
        get: (source: ImmutableList<string>) => source.values,
        set: (source: string[], ctx) => source.map(ctx.idMap),
    },
    'size': {
        get: (source: Vec2) => ({ x: source.x, y: source.y }),
        set: (source: any) => new Vec2(source.x, source.y),
    },
};

const DIAGRAM_SERIALIZERS: PropertySerializers = {
    'id': {
        get: (source) => source,
        set: (source, ctx) => ctx.idMap(source),
    },
    'master': {
        get: (source) => source,
        set: (source, ctx) => ctx.idMap(source),
    },
    'items': {
        get: (source: ImmutableMap<DiagramItem>) => source.values.map(writeDiagramItem),
        set: (source: any[], context) => buildObject(source.map(x => readDiagramItem(x, context)), x => x.id),
    },
    'itemIds': {
        get: (source: ImmutableList<string>) => source.values,
        set: (source: string[], ctx) => source.map(ctx.idMap),
    },
    'title': {
        get: (source) => source,
        set: (source) => source,
    },
};

const DIAGRAM_ITEM_SERIALIZERS: PropertySerializers = {
    'appearance': {
        get: (source: ImmutableMap<any>) => source.raw,
        set: (source: any) => source,
    },
    'childIds': {
        get: (source: ImmutableList<string>) => source.values,
        set: (source: string[], ctx) => source.map(ctx.idMap),
    },
    'id': {
        get: (source) => source,
        set: (source, ctx) => ctx.idMap(source),
    },
    'isLocked': {
        get: (source) => source,
        set: (source) => source,
    },
    'name': {
        get: (source) => source,
        set: (source) => source,
    },
    'renderer': {
        get: (source) => source,
        set: (source) => source,
    },
    'rotation': {
        get: (source: Rotation) => source.degree,
        set: (source: any) => Rotation.fromDegree(source),
    },
    'type': {
        get: (source) => source,
        set: (source) => source,
    },
    'transform': {
        get: (source: Transform) => source.toJS(),
        set: (source: any) => Transform.fromJS(source),
    },
};

function buildObject<V>(source: ReadonlyArray<V | undefined | null>, selector: (source: V) => string) {
    const result: { [key: string]: V } = {};

    for (const item of source) {
        if (item) {
            result[selector(item)] = item;
        }
    }

    return result;
}