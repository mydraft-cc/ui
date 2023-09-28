/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { createYjsProvider } from '@y-sweet/client';
import * as React from 'react';
import * as Y from 'yjs';
import { useYjsReduxBinder } from 'yjs-redux';
import { useAsyncEffect } from '@app/core';
import { postCollaborationToken } from '@app/wireframes/api';
import { useStore } from '@app/wireframes/model';
import { CollaborationContext, CollaborationState } from './../hooks';

export const CollaborationProvider = (props: { children: React.ReactNode }) => {
    const [state, setState] = React.useState<CollaborationState>({});
    const binder = useYjsReduxBinder();
    const editor = useStore(x => x.editor);
    const editorId = editor.id;

    useAsyncEffect(async cancellation => {
        const clientDoc = new Y.Doc();
        const clientToken = await postCollaborationToken(editorId);

        if (cancellation?.isCancelled) {
            return undefined;
        }
        
        const provider = createYjsProvider(clientDoc, clientToken, {
            disableBc: true,
        });

        provider.connect();

        await new Promise(resolve => {
            const handler = () => {
                if (provider.wsconnected) {
                    resolve(true);
                }
            };

            provider.on('status', handler);
        });

        if (cancellation?.isCancelled) {
            return undefined;
        }

        const unbind = binder.connectSlice(clientDoc, 'editor',
            root => {
                setState(state => ({
                    ...state,
                    undoManager: new Y.UndoManager(root),
                }));
            },
        );

        setState({ document: clientDoc, provider });

        return () => {
            clientDoc.destroy();

            provider.disconnect();
            provider.destroy();

            unbind();
        };
    }, [editorId, binder]);

    return (
        <CollaborationContext.Provider value={state}>
            {props.children}
        </CollaborationContext.Provider>
    );
};