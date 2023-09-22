/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/naming-convention */

import { MathHelper } from '@app/core';
import { EditorState, loadDiagramInternal, selectDiagram, selectItems } from '@app/wireframes/model';
import * as Reducers from '@app/wireframes/model/actions';
const diff = require('deep-diff').diff;
const v1 = require('./diagram_v1.json');
const v2 = require('./diagram_v2.json');
const v3 = require('./diagram_v3.json');

describe('LoadingReducer', () => {
    const userId = MathHelper.guid();

    const editorState = EditorState.create();
    const editorReducer = Reducers.createClassReducer(editorState, builder => {
        Reducers.buildAlignment(builder);
        Reducers.buildAppearance(builder);
        Reducers.buildDiagrams(builder, userId);
        Reducers.buildGrouping(builder, userId);
        Reducers.buildItems(builder, userId);
        Reducers.buildOrdering(builder);
    });

    const ignore = (path: string, key: string) => {
        return (path.length === 1 && path[0] === 'values' && key === 'id') || ~['instanceId', 'selectedIds', 'parents', 'computed'].indexOf(key);
    };        

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
    
    const rootReducer = Reducers.rootLoading(editorReducer, MathHelper.guid());

    it('should load from old and new format V2', () => {
        const initial = undoableReducer(undefined, { type: 'NOOP' });

        const editorV1 = rootReducer(initial, loadDiagramInternal(v1, '1'));
        const editorV2 = rootReducer(initial, loadDiagramInternal(v2, '2'));

        expect(editorV1.present.diagrams.values[0].items.values.length).toEqual(10);
        expect(editorV2.present.diagrams.values[0].items.values.length).toEqual(10);

        const diffsV2 = diff(editorV1.present, editorV2.present, ignore);

        expect(diffsV2).toEqual(undefined);
    });

    it('should load from old and new format V3', () => {
        const initial = undoableReducer(undefined, { type: 'NOOP' });

        const editorV1 = rootReducer(initial, loadDiagramInternal(v1, '1'));
        const editorV3 = rootReducer(initial, loadDiagramInternal(v3, '2'));

        expect(editorV1.present.diagrams.values[0].items.values.length).toEqual(10);
        expect(editorV3.present.diagrams.values[0].items.values.length).toEqual(10);

        const diffsV3 = diff(editorV1.present, editorV3.present, ignore);

        expect(diffsV3).toEqual(undefined);
    });
});