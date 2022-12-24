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

    it('should load from old and new format', () => {
        const initial = undoableReducer(undefined, { type: 'NOOP' });

        const editorV1 = rootReducer(initial, loadDiagramInternal({ stored: v1, requestId: '1' }));
        const editorV2 = rootReducer(initial, loadDiagramInternal({ stored: v2, requestId: '2' }));

        expect(editorV1.present.diagrams.values[0].items.values.length).toEqual(10);
        expect(editorV2.present.diagrams.values[0].items.values.length).toEqual(10);

        const diffs = diff(editorV1.present, editorV2.present, (_: string, key: string) => ~['instanceId', 'selectedIds', 'parents', 'computed'].indexOf(key));

        expect(diffs).toEqual(undefined);
    });
});