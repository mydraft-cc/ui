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

export class Serializer {
    constructor(
        private readonly rendererService: RendererService,
    ) {
    }

    public deserializeSet(json: string, assignNewIds = false): DiagramItemSet {
        const allItems: DiagramItem[] = [];

        const context = this.createContext(assignNewIds);

        const input = JSON.parse(json);

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

    public serializeSet(set: DiagramItemSet) {
        const output: any = { visuals: [], groups: [] };

        for (const item of Object.values(set.allItems)) {
            const serialized = writeDiagramItem(item);

            if (item.type === 'Shape') {
                output.visuals.push(serialized);
            } else {
                output.groups.push(serialized);
            }
        }

        return JSON.stringify(output);
    }

    public deserializeEditor(json: string) {
        const context = this.createContext();

        const input = JSON.parse(json);

        return readEditor(input, context);
    }

    public serializeEditor(editor: EditorState) {
        const output = writeEditor(editor);

        return JSON.stringify(output);
    }

    private createContext(assignNewIds = false) {
        const context: SerializerContext = { idMap: (id: string) => id, rendererService: this.rendererService };

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

    const itemSet = new DiagramItemSet(raw.items);

    return Diagram.create({ ...raw, ...itemSet });    
}

function readDiagramItem(source: object, context: SerializerContext) {
    const raw: any = readObject(source, DIAGRAM_ITEM_SERIALIZERS, context);

    if (raw.type === 'Shape') {
        const defaults = context.rendererService.get(raw.renderer!)?.createDefaultShape();

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

    rendererService: RendererService;
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
    'orderedDiagrams': {
        get: (source: ImmutableList<Diagram>) => source.raw.map(writeDiagram),
        set: (source: any[], ctx) => source.map(x => readDiagram(x, ctx)).filter(x => !!x),
    },
    'size': {
        get: (source: Vec2) => source.toJS(),
        set: (source: any) => Vec2.fromJS(source),
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
        set: (source: any[], context) => source.map(x => readDiagramItem(x, context)).filter(x => !!x),
    },
    'rootIds': {
        get: (source: ImmutableList<string>) => source.raw,
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
        get: (source: ImmutableList<string>) => source.raw,
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
        get: (source: Rotation) => source.toJS(),
        set: (source: any) => Rotation.fromJS(source),
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