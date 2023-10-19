/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/naming-convention */

import { MathHelper } from '@app/core';
import { EditorState, loadDiagramInternal } from '@app/wireframes/model';
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
        return (path.length === 1 && path[0] === 'values' && key === 'id') || ~['instanceId', 'selectedIds', 'parents', 'computed', '__instanceId'].indexOf(key);
    };
    
    const rootReducer = Reducers.rootLoading(editorReducer, userId);

    it('should load from old and new format V2', () => {
        const initial = editorState;

        const editorV1 = rootReducer(initial, loadDiagramInternal(v1, '1')) as EditorState;
        const editorV2 = rootReducer(initial, loadDiagramInternal(v2, '2')) as EditorState;

        expect(editorV1.diagrams.values[0].items.values.length).toEqual(10);
        expect(editorV2.diagrams.values[0].items.values.length).toEqual(10);

        const diffsV2 = diff(editorV1, editorV2, ignore);

        expect(diffsV2).toEqual(undefined);
    });

    it('should load from old and new format V3', () => {
        const initial = editorState;

        const editorV1 = rootReducer(initial, loadDiagramInternal(v1, '1')) as EditorState;
        const editorV3 = rootReducer(initial, loadDiagramInternal(v3, '2')) as EditorState;

        expect(editorV1.diagrams.values[0].items.values.length).toEqual(10);
        expect(editorV3.diagrams.values[0].items.values.length).toEqual(10);

        const diffsV3 = diff(editorV1, editorV3, ignore);

        expect(diffsV3).toEqual(undefined);
    });
});