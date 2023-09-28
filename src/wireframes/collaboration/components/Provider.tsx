/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { TiptapCollabProvider } from '@hocuspocus/provider';
import * as React from 'react';
import * as Y from 'yjs';
import { useYjsReduxBinder } from 'yjs-redux';
import { useAsyncEffect } from '@app/core';
import { useStore } from '@app/wireframes/model';
import { CollaborationContext, CollaborationState } from './../hooks';

export const CollaborationProvider = (props: { children: React.ReactNode }) => {
    const [state, setState] = React.useState<CollaborationState>({});
    const binder = useYjsReduxBinder();
    const editor = useStore(x => x.editor);
    const editorId = editor.id;

    useAsyncEffect(async cancellation => {
        const provider = new TiptapCollabProvider({ appId: '7ME5ZQMY', name: editorId });

        provider.connect();

        await new Promise(resolve => {
            const handler = () => {
                if (!provider.hasUnsyncedChanges && provider.isConnected) {
                    resolve(true);
                }
            };

            provider.on('unsyncedChanges', handler);
        });

        if (cancellation?.isCancelled) {
            return undefined;
        }

        const synchronizer = binder.connectSlice(provider.document, 'editor');

        synchronizer.on('connected', ({ root }) => {
            setState(state => ({
                ...state,
                undoManager: new Y.UndoManager(root),
            }));
        });

        setState({ document: provider.document, provider });

        return () => {
            synchronizer.destroy();
            provider.disconnect();
            provider.destroy();
        };
    }, [editorId, binder]);

    return (
        <CollaborationContext.Provider value={state}>
            {props.children}
        </CollaborationContext.Provider>
    );
};