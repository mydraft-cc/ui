/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable @typescript-eslint/naming-convention */

import { diff } from 'deep-object-diff';
import { EditorState, loadDiagramInternal, selectDiagram, selectItems } from '@app/wireframes/model';
import * as Reducers from '@app/wireframes/model/actions';
import v1 from './diagram_v1.json?raw';
import v2 from './diagram_v2.json?raw';
import v3 from './diagram_v3.json?raw';

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

    /*const ignore = (path: string, key: string) => {
        return (path.length === 1 && path[0] === 'values' && key === 'id') || ~['instanceId', 'selectedIds', 'parents', 'computed'].indexOf(key);
    };*/        

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

        const editorV1 = rootReducer(initial, loadDiagramInternal(v1, '1'));
        const editorV2 = rootReducer(initial, loadDiagramInternal(v2, '2'));

        expect(editorV1.present.diagrams.values[0].items.values.length).toEqual(10);
        expect(editorV2.present.diagrams.values[0].items.values.length).toEqual(10);

        const diffsV2 = diff(editorV1.present, editorV2.present);

        expect(diffsV2).toEqual(undefined);
    });

    it('should load from old and new format V3', () => {
        const initial = undoableReducer(undefined, { type: 'NOOP' });

        const editorV1 = rootReducer(initial, loadDiagramInternal(v1, '1'));
        const editorV3 = rootReducer(initial, loadDiagramInternal(v3, '2'));

        expect(editorV1.present.diagrams.values[0].items.values.length).toEqual(10);
        expect(editorV3.present.diagrams.values[0].items.values.length).toEqual(10);

        const diffsV3 = diff(editorV1.present, editorV3.present);

        expect(diffsV3).toEqual(undefined);
    });
});