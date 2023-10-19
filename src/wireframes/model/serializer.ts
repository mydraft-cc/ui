/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper, Rotation, Vec2 } from '@app/core';
import { Diagram } from './diagram';
import { DiagramItem } from './diagram-item';
import { DiagramItemSet } from './diagram-item-set';
import { EditorState } from './editor-state';
import { RendererService } from './renderer.service';
import { Transform } from './transform';

type IdMap = { [id: string]: string };

export module Serializer {
    export function tryGenerateNewIds(json: string): string {
        try {
            return generateNewIds(json);
        } catch {
            return json;
        }
    }

    export function generateNewIds(json: string): string {
        const input = JSON.parse(json);

        const idMap: IdMap = {};

        for (const jsonShape of input.visuals) {
            const oldId = jsonShape.id;

            jsonShape.id = MathHelper.nextId();

            idMap[oldId] = jsonShape.id;
        }

        for (const jsonGroup of input.groups) {
            const oldId = jsonGroup.id;

            jsonGroup.id = MathHelper.nextId();

            idMap[oldId] = jsonGroup.id;
        }

        for (const jsonGroup of input.groups) {
            jsonGroup.childIds = jsonGroup.childIds.map((id: string) => idMap[id]);
        }

        return JSON.stringify(input);
    }

    export function deserializeSet(input: any): DiagramItemSet {
        const allItems: DiagramItem[] = [];

        for (const inputVisual of input.visuals) {
            const item = readDiagramItem(inputVisual, 'Shape');

            if (item) {
                allItems.push(item);
            }
        }

        for (const inputGroup of input.groups) {
            const item = readDiagramItem(inputGroup, 'Group');

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
        return readEditor(input);
    }

    export function serializeEditor(editor: EditorState) {
        const output = writeEditor(editor);

        return output;
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

function writeObject(source: object, serializers: PropertySerializers<any>) {
    const result = {};

    for (const [key, value] of Object.entries(source)) {
        const serializer = serializers[key];

        if (serializer) {
            result[key] = serializer.get(value);
        }
    }

    return result;
}

function readEditor(source: object) {
    const raw: any = readObject(source, EDITOR_SERIALIZERS);

    return EditorState.create(raw);
}

function readDiagram(source: object) {
    const raw: any = readObject(source, DIAGRAM_SERIALIZERS);

    if (!raw.itemIds) {
        raw.itemIds = source['itemIds'];
    }

    if (!raw.itemIds) {
        raw.itemIds = source['rootIds'];
    }

    return Diagram.create(raw);
}

function readDiagramItem(source: object, type?: any) {
    const raw: any = readObject(source, DIAGRAM_ITEM_SERIALIZERS);

    if ((raw.type || type) === 'Shape') {
        const defaults = RendererService.get(raw.renderer!)?.createDefaultShape();

        if (!defaults) {
            return null;
        }

        return DiagramItem.createShape({ ...defaults, ...raw });
    } else {
        return DiagramItem.createGroup(raw);
    }
}

function readObject(source: object, serializers: PropertySerializers<any>) {
    const result = {};

    for (const [key, value] of Object.entries(source)) {
        const serializer = serializers[key];

        if (serializer) {
            result[key] = serializer.set(value);
        }
    }

    return result;
}

interface PropertySerializer<T, K extends keyof T> {
    get(source: T[K]): any;
    
    set(source: any): any;
}

type PropertySerializers<T> = Partial<{
    [Property in keyof T]: PropertySerializer<T, Property>;
}> & {
    [key: string]: PropertySerializer<any, any>;
};

const EDITOR_SERIALIZERS: PropertySerializers<EditorState> = {
    'id': {
        get: source => source,
        set: source => source,
    },
    'diagrams': {
        get: source => source.values.map(writeDiagram),
        set: source => buildObject((source as any[]).map(readDiagram), x => x.id),
    },
    'diagramIds': {
        get: source => source.values,
        set: source => source,
    },
    'size': {
        get: source => source.toJS(),
        set: source => Vec2.fromJS(source),
    },
};

const DIAGRAM_SERIALIZERS: PropertySerializers<Diagram> = {
    'id': {
        get: source => source,
        set: source => source,
    },
    'master': {
        get: source => source,
        set: source => source,
    },
    'items': {
        get: source => source.values.map(writeDiagramItem),
        set: source => buildObject((source as any[]).map(readDiagramItem), x => x.id),
    },
    'itemIds': {
        get: source => source.values,
        set: source => source,
    },
    'rootIds': {
        get: source => { throw new Error(`Not supported to serialize ${source}.`); },
        set: source => source,
    },
    'title': {
        get: source => source,
        set: source => source,
    },
};

const DIAGRAM_ITEM_SERIALIZERS: PropertySerializers<DiagramItem> = {
    'appearance': {
        get: source => source.raw,
        set: source => source,
    },
    'childIds': {
        get: source => source.values,
        set: source => source,
    },
    'id': {
        get: source => source,
        set: source => source,
    },
    'isLocked': {
        get: source => source,
        set: source => source,
    },
    'name': {
        get: source => source,
        set: source => source,
    },
    'renderer': {
        get: source => source,
        set: source => source,
    },
    'rotation': {
        get: source => source.toJS(),
        set: source => Rotation.fromJS(source),
    },
    'type': {
        get: (source) => source,
        set: (source) => source,
    },
    'transform': {
        get: source => source.toJS(),
        set: source => Transform.fromJS(source),
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