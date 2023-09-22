/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { WebrtcProvider } from 'y-webrtc';
import * as Y from 'yjs';
import { useYjsReduxBinder } from 'yjs-redux';
import { useStore } from '@app/wireframes/model';
import { CollaborationContext, CollaborationState } from './../hooks';

export const CollaborationProvider = (props: { children: React.ReactNode }) => {
    const [state, setState] = React.useState<CollaborationState>({});
    const editorId = useStore(x => x.editor.id);
    const editorBinder = useYjsReduxBinder();

    React.useEffect(() => {
        const document = new Y.Doc();
        const provider = new WebrtcProvider(editorId, document);

        console.log(`Connecting to room id '${editorId}'.`);

        const unbind = editorBinder.connectSlice(document, 'editor',
            root => {
                setState(state => ({
                    ...state,
                    undoManager: new Y.UndoManager(root),
                }));
            },
        );

        setState({ document, provider });

        return () => {
            document.destroy();

            provider.disconnect();
            provider.destroy();

            unbind();
        };
    }, [editorBinder, editorId]);

    return (
        <CollaborationContext.Provider value={state}>
            {props.children}
        </CollaborationContext.Provider>
    );
};