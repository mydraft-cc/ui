/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { TiptapCollabProvider } from '@hocuspocus/provider';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import * as Y from 'yjs';
import { useYjsReduxBinder } from 'yjs-redux';
import { useAsyncEffect } from '@app/core';
import { EditorState, selectDiagram, useStore } from '@app/wireframes/model';
import { user } from '@app/wireframes/user';
import { CollaborationContext, CollaborationState } from './../hooks';

export const CollaborationProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useDispatch();
    const binder = useYjsReduxBinder();
    const editor = useStore(x => x.editor);
    const editorId = editor.id;
    const [state, setState] = React.useState<CollaborationState>({});

    useAsyncEffect(async cancellation => {
        setState({});
    
        const provider = new TiptapCollabProvider({ appId: '7ME5ZQMY', name: editorId });

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
            onSynced: root => {
                setState(state => ({
                    ...state,
                    undoManager: new Y.UndoManager(root),
                }));
            },
            onSyncedAsInit: (state: EditorState) => {
                setTimeout(() => {
                    if (!state.selectedDiagramIds.get(user.id) && state.diagramIds.size > 0) {
                        dispatch(selectDiagram(state.diagramIds.at(0)!));
                    }
                });
            },
            document,
        });

        setState({ document, provider });

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