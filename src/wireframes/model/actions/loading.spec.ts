/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/naming-convention */

import { EditorState, loadDiagramInternal, selectDiagram, selectItems } from '@app/wireframes/model';
import * as Reducers from '@app/wireframes/model/actions';
const diff = require('deep-diff').diff;
const v1 = require('./diagram_v1.json');
const v2 = require('./diagram_v2.json');
const v3 = require('./diagram_v3.json');

describe('LoadingReducer', () => {
    const editorState = EditorState.create();

    const editorReducer = Reducers.createClassReducer(editorState, builder => {
        Reducers.buildAlignment(builder);
        Reducers.buildAppearance(builder);
        Reducers.buildDiagrams(builder);
        Reducers.buildGrouping(builder);
        Reducers.buildItems(builder);
        Reducers.buildOrdering(builder);
    });

    const ignore = (_: string, key: string) => ~['instanceId', 'selectedIds', 'parents', 'computed'].indexOf(key);

    const undoableReducer = Reducers.undoable(
        editorReducer,
        editorState, {
            capacity: 20,
            actionMerger: Reducers.mergeAction,
            actionsToIgnore: [
                selectDiagram.name,
                selectItems.name,
            ],
        });
    
    const rootReducer = Reducers.rootLoading(undoableReducer, editorReducer);

    it('should load from old and new format V2', () => {
        const initial = undoableReducer(undefined, { type: 'NOOP' });

        const editorV1 = rootReducer(initial, loadDiagramInternal({ stored: v1, requestId: '1' }));
        const editorV2 = rootReducer(initial, loadDiagramInternal({ stored: v2, requestId: '2' }));

        expect(editorV1.present.diagrams.values[0].items.values.length).toEqual(10);
        expect(editorV2.present.diagrams.values[0].items.values.length).toEqual(10);

        const diffsV2 = diff(editorV1.present, editorV2.present, ignore);

        expect(diffsV2).toEqual(undefined);
    });

    it('should load from old and new format V3', () => {
        const initial = undoableReducer(undefined, { type: 'NOOP' });

        const editorV1 = rootReducer(initial, loadDiagramInternal({ stored: v1, requestId: '1' }));
        const editorV3 = rootReducer(initial, loadDiagramInternal({ stored: v3, requestId: '2' }));

        expect(editorV1.present.diagrams.values[0].items.values.length).toEqual(10);
        expect(editorV3.present.diagrams.values[0].items.values.length).toEqual(10);

        const diffsV3 = diff(editorV1.present, editorV3.present, ignore);

        expect(diffsV3).toEqual(undefined);
    });
});