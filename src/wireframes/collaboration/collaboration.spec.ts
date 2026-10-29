/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { applyMiddleware, combineReducers, legacy_createStore as createStore, Store } from 'redux';
import * as Y from 'yjs';
import { createYjsReduxBinder } from 'yjs-redux';
import { Vec2 } from '@app/core/utils';
import { addDiagram, addShape, buildAlignment, buildAppearance, buildDiagrams, buildGrouping, buildItems, buildOrdering, changeItemsAppearance, createClassReducer, EditorState, PluginRegistry, removeItems, renameItems, restoreDiagram, rootLoading, selectItems, Transform, transformItems } from '@app/wireframes/model';
import { Button } from '@app/wireframes/shapes/neutral/button';
import { EDITOR_SLICE, hasEditorState } from './binder';
import { createSyncOptions } from './resolvers';
import { UndoManager } from './undo-manager';
import { user } from './user';
import { addVersion, getVersions, readVersion } from './versions';

type Client = { store: Store<{ editor: EditorState }>; document: Y.Doc; undoManager: UndoManager };

describe('Collaboration', () => {
    PluginRegistry.addPlugin(new Button());

    const editorReducer = createClassReducer(EditorState.create(), builder => {
        buildAlignment(builder);
        buildAppearance(builder);
        buildDiagrams(builder);
        buildGrouping(builder);
        buildItems(builder);
        buildOrdering(builder);
    });

    function createClient(initial?: EditorState, remote?: Client): Client {
        const binder = createYjsReduxBinder(createSyncOptions());
        const document = new Y.Doc();

        if (remote) {
            // Joining clients wait for the remote state before they connect the store.
            Y.applyUpdate(document, Y.encodeStateAsUpdate(remote.document), 'remote');
        }

        const store = createStore(
            binder.enhanceReducer(combineReducers({ editor: rootLoading(editorReducer) })) as any,
            { editor: initial || editorReducer(EditorState.create(), addDiagram('d1')) } as any,
            applyMiddleware(binder.middleware),
        ) as Store<{ editor: EditorState }>;

        binder.connectSlice({ document, sliceName: EDITOR_SLICE });

        return { store, document, undoManager: new UndoManager(document.getMap(EDITOR_SLICE)) };
    }

    function connect(a: Client, b: Client) {
        a.document.on('update', (update: Uint8Array, origin: unknown) => {
            if (origin !== 'remote') {
                Y.applyUpdate(b.document, update, 'remote');
            }
        });

        b.document.on('update', (update: Uint8Array, origin: unknown) => {
            if (origin !== 'remote') {
                Y.applyUpdate(a.document, update, 'remote');
            }
        });
    }

    function createPair() {
        const a = createClient();

        // The second client joins the room of the first one.
        const b = createClient(EditorState.create({ id: a.store.getState().editor.id }), a);

        connect(a, b);

        return [a, b];
    }

    const diagramOf = (client: Client) => client.store.getState().editor.diagrams.get('d1')!;
    const shapeOf = (client: Client, id: string) => diagramOf(client).items.get(id)!;

    it('should sync the initial state to the joining client', () => {
        const [, b] = createPair();

        expect(diagramOf(b)).toBeDefined();
        expect(diagramOf(b).rootIds.values).toEqual([]);
    });

    it('should sync added shapes', () => {
        const [a, b] = createPair();

        a.store.dispatch(addShape('d1', 'Button', { position: { x: 100, y: 50 } }, 's1'));

        const shape = shapeOf(b, 's1');

        // The shape has been deserialized from yjs and is not shared between the stores.
        expect(shape).not.toBe(shapeOf(a, 's1'));
        expect(shape.renderer).toEqual('Button');
        expect(shape.transform.position).toEqual(shapeOf(a, 's1').transform.position);
        expect(shape.configurables).toEqual(shapeOf(a, 's1').configurables);
        expect(diagramOf(b).rootIds.values).toEqual(['s1']);
    });

    it('should merge concurrent changes of different properties of the same shape', () => {
        const [a, b] = createPair();

        a.store.dispatch(addShape('d1', 'Button', {}, 's1'));

        const oldBounds = shapeOf(a, 's1').transform;
        const newBounds = oldBounds.moveTo(new Vec2(300, 400));

        a.store.dispatch(transformItems('d1', ['s1'], oldBounds, newBounds));
        b.store.dispatch(changeItemsAppearance('d1', ['s1'], 'TEXT', 'Hello'));

        for (const client of [a, b]) {
            expect(Transform.equals(shapeOf(client, 's1').transform, newBounds)).toBeTruthy();
            expect(shapeOf(client, 's1').getAppearance('TEXT')).toEqual('Hello');
        }
    });

    it('should keep the selection local', () => {
        const [a, b] = createPair();

        a.store.dispatch(addShape('d1', 'Button', {}, 's1'));

        let updates = 0;
        a.document.on('update', () => updates++);

        a.store.dispatch(selectItems('d1', ['s1']));

        expect(updates).toEqual(0);
        expect(diagramOf(a).selectedIds.has('s1')).toBeTruthy();
        expect(diagramOf(b).selectedIds.has('s1')).toBeFalsy();
    });

    it('should keep the local selection when receiving remote changes', () => {
        const [a, b] = createPair();

        a.store.dispatch(addShape('d1', 'Button', {}, 's1'));
        a.store.dispatch(selectItems('d1', ['s1']));

        b.store.dispatch(renameItems('d1', ['s1'], 'Renamed'));

        expect(shapeOf(a, 's1').name).toEqual('Renamed');
        expect(diagramOf(a).selectedIds.has('s1')).toBeTruthy();
    });

    it('should sync removed shapes', () => {
        const [a, b] = createPair();

        a.store.dispatch(addShape('d1', 'Button', {}, 's1'));
        b.store.dispatch(removeItems('d1', ['s1']));

        expect(shapeOf(a, 's1')).toBeUndefined();
        expect(diagramOf(a).rootIds.values).toEqual([]);
    });

    it('should only undo local changes', () => {
        const [a, b] = createPair();

        a.store.dispatch(addShape('d1', 'Button', {}, 's1'));
        a.undoManager['inner'].stopCapturing();

        b.store.dispatch(addShape('d1', 'Button', {}, 's2'));

        a.undoManager.undo();

        for (const client of [a, b]) {
            expect(shapeOf(client, 's1')).toBeUndefined();
            expect(shapeOf(client, 's2')).toBeDefined();
        }

        a.undoManager.redo();

        expect(shapeOf(b, 's1')).toBeDefined();
    });

    it('should not detect editor state in an empty room', () => {
        const [a] = createPair();
        const empty = new Y.Doc();

        expect(hasEditorState(empty)).toBeFalsy();
        expect(empty.share.has(EDITOR_SLICE)).toBeFalsy();

        Y.applyUpdate(empty, Y.encodeStateAsUpdate(a.document));

        expect(hasEditorState(empty)).toBeTruthy();
    });

    it('should restore a version for all clients and keep the room', () => {
        const [a, b] = createPair();
        const room = a.store.getState().editor.id;

        a.store.dispatch(addShape('d1', 'Button', {}, 's1'));

        const version = addVersion(a.document, 'v1', a.store.getState().editor, user);

        b.store.dispatch(removeItems('d1', ['s1']));
        b.store.dispatch(restoreDiagram(readVersion(getVersions(b.document)[0])));

        expect(version.name).toEqual('v1');

        for (const client of [a, b]) {
            expect(client.store.getState().editor.id).toEqual(room);
            expect(shapeOf(client, 's1')).toBeDefined();
        }
    });

    it('should not undo selection changes', () => {
        const [a] = createPair();

        a.store.dispatch(addShape('d1', 'Button', {}, 's1'));
        a.undoManager['inner'].stopCapturing();

        a.store.dispatch(selectItems('d1', ['s1']));
        a.undoManager.undo();

        expect(shapeOf(a, 's1')).toBeUndefined();
    });
});
