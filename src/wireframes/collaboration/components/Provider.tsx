/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { HocuspocusProvider  } from '@hocuspocus/provider';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import * as Y from 'yjs';
import { useYjsReduxBinder } from 'yjs-redux';
import { useAsyncEffect } from '@app/core';
import { EditorState, selectDiagram, useStore } from '@app/wireframes/model';
import { user } from '@app/wireframes/user';
import { CollaborationContext, CollaborationState } from './../hooks';
import { ExendedUndoManager } from './../services/extended-undo-manager';

export const CollaborationProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useDispatch();
    const binder = useYjsReduxBinder();
    const editor = useStore(x => x.editor);
    const editorId = editor.id;
    const [state, setState] = React.useState<CollaborationState>({});

    useAsyncEffect(async cancellation => {
        setState({});
    
        const provider = new HocuspocusProvider({ url: import.meta.env.VITE_SERVER_COLLABORATION_URL, name: editorId });

        await new Promise(resolve => {
            const handler = () => {
                if (!provider.hasUnsyncedChanges && provider.isConnected) {
                    resolve(true);
                }
            };

            provider.on('unsyncedChanges', handler);
        });

        if (cancellation?.isCancelled) {
            return () => {
                provider.destroy();
            };
        }

        const document = provider.document;

        const synchronizer = binder.connectSlice({
            sliceName: 'editor',
            onSynced: (s, root) => {
                setState(state => ({
                    ...state,
                    undoManager: new ExendedUndoManager(new Y.UndoManager(root), () => s.getcurrentAction()),
                }));
            },
            onSyncedAsInit: (_, state: EditorState) => {
                setTimeout(() => {
                    if (!state.selectedDiagramIds.get(user.id) && state.diagramIds.size > 0) {
                        dispatch(selectDiagram(state.diagramIds.at(0)!));
                    }
                });
            },
            document,
        });

        setState(s => ({ ...s, document, provider }));

        return () => {
            synchronizer.destroy();
            provider.disconnect();
            provider.destroy();
        };
    }, [editorId, binder]);

    return (
        <CollaborationContext.Provider value={state}>
            {children}
        </CollaborationContext.Provider>
    );
};