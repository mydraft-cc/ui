/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/naming-convention */

import { diff } from 'deep-object-diff';
import { Types } from '@app/core';
import { EditorState, loadDiagramInternal, PluginRegistry } from '@app/wireframes/model';
import * as Reducers from '@app/wireframes/model/actions';
import { Button } from '@app/wireframes/shapes/neutral/button';
import v1 from './diagram_v1.json?raw';
import v2 from './diagram_v2.json?raw';
import v3 from './diagram_v3.json?raw';

describe('LoadingReducer', () => {
    const editorState = EditorState.create();

    PluginRegistry.addPlugin(new Button());

    const editorReducer = Reducers.createClassReducer(editorState, builder => {
        Reducers.buildAlignment(builder);
        Reducers.buildAppearance(builder);
        Reducers.buildDiagrams(builder);
        Reducers.buildGrouping(builder);
        Reducers.buildItems(builder);
        Reducers.buildOrdering(builder);
    });

    const rootReducer = Reducers.rootLoading(editorReducer);

    it('should load from old and new format V2', () => {
        const initial = editorReducer(undefined, { type: 'NOOP' });

        const editorV1 = rootReducer(initial, loadDiagramInternal(JSON.parse(v1), '1')) as EditorState;
        const editorV2 = rootReducer(initial, loadDiagramInternal(JSON.parse(v2), '2')) as EditorState;

        expect(editorV1.diagrams.values[0].items.size).toEqual(10);
        expect(editorV2.diagrams.values[0].items.size).toEqual(10);

        const diffsV2 = cleanupDiffs(diff(editorV1, editorV2), []);

        expect(diffsV2).toEqual(undefined);
    });

    it('should load from old and new format V3', () => {
        const initial = editorReducer(undefined, { type: 'NOOP' });

        const editorV1 = rootReducer(initial, loadDiagramInternal(JSON.parse(v1), '1')) as EditorState;
        const editorV3 = rootReducer(initial, loadDiagramInternal(JSON.parse(v3), '2')) as EditorState;

        expect(editorV1.diagrams.values[0].items.size).toEqual(10);
        expect(editorV3.diagrams.values[0].items.size).toEqual(10);

        const diffsV3 = cleanupDiffs(diff(editorV1, editorV3), []);

        expect(diffsV3).toEqual(undefined);
    });

    function cleanupDiffs(input: Record<string, any>, path: string[]) {
        for (const [key, value] of Object.entries(input)) {
            if (path.length === 1 && path[0] === 'values' && key === 'id') {
                delete input[key];
                continue;
            }

            if (~['instanceId', '__instanceId', 'selectedIds', 'parents', 'computed'].indexOf(key)) {
                delete input[key];
                continue;
            } 
            
            if (typeof value === 'object') {
                const diff = cleanupDiffs(value, [...path, key]);

                if (Types.isUndefined(diff)) {
                    delete input[key];
                }
            }
        }

        if (Object.keys(input).length === 0) {
            return undefined;
        }

        return input;
    }
});