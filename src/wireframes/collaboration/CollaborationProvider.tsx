/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { HocuspocusProvider } from '@hocuspocus/provider';
import * as React from 'react';
import type { Awareness } from 'y-protocols/awareness';
import * as Y from 'yjs';
import { useAppDispatch } from '@app/store';
import { EditorState, newDiagram, selectDiagram, useStore } from '@app/wireframes/model';
import { binder, EDITOR_SLICE } from './binder';
import { UndoManager } from './undo-manager';
import { user } from './user';

const COLLABORATION_URL: string | undefined = import.meta.env.VITE_SERVER_COLLABORATION_URL;

export type CollaborationStatus = 'Offline' | 'Connecting' | 'Connected';

export interface CollaborationState {
    // True, if collaboration is configured for this deployment.
    isSupported: boolean;

    // The name of the room, if the current diagram is shared live.
    room: string | null;

    // The connection status to the collaboration server.
    status: CollaborationStatus;

    // The undo manager, which only reverts local changes.
    undoManager?: UndoManager;

    // The awareness to share presence information with the other users.
    awareness?: Awareness | null;

    // Shares the current diagram live.
    start: () => void;

    // Opens the room with the given name.
    join: (room: string) => void;
}

export const CollaborationContext = React.createContext<CollaborationState>({
    isSupported: false,
    room: null,
    status: 'Offline',
    start: () => {},
    join: () => {},
});

export const CollaborationProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();
    const editorId = useStore(s => s.editor.id);
    const joining = React.useRef<string | null>(null);
    const [room, setRoom] = React.useState<string | null>(null);
    const [status, setStatus] = React.useState<CollaborationStatus>('Offline');
    const [undoManager, setUndoManager] = React.useState<UndoManager>();
    const [awareness, setAwareness] = React.useState<Awareness | null>();

    const isLive = !!COLLABORATION_URL && room === editorId;

    React.useEffect(() => {
        const document = new Y.Doc();

        // Only the client that joins an existing room has to wait for the remote state.
        const isJoining = isLive && joining.current === editorId;

        let network: HocuspocusProvider | null = null;
        let synchronizer: ReturnType<typeof binder.connectSlice> | null = null;
        let localUndoManager: UndoManager | null = null;
        let isDisposed = false;

        const connect = () => {
            if (isDisposed || synchronizer) {
                return;
            }

            // Only the live document that has waited for the remote state completes the join.
            if (isJoining) {
                joining.current = null;
            }

            synchronizer = binder.connectSlice({
                document,
                sliceName: EDITOR_SLICE,
                onSyncedAsInit: (_, state: EditorState) => {
                    // The synchronizer is not subscribed yet, so we cannot dispatch actions synchronously.
                    setTimeout(() => {
                        if (!isDisposed && !state.diagrams.get(state.selectedDiagramId!) && state.diagramIds.size > 0) {
                            dispatch(selectDiagram(state.diagramIds.at(0)!));
                        }
                    });
                },
            });

            // Create the undo manager after the initial sync, so that it cannot be undone.
            localUndoManager = new UndoManager(document.getMap(EDITOR_SLICE));

            setUndoManager(localUndoManager);
        };

        if (isLive) {
            setStatus('Connecting');

            network = new HocuspocusProvider({
                url: COLLABORATION_URL!,
                name: editorId,
                document,
                onSynced: () => {
                    setStatus('Connected');
                    connect();
                },
                onDisconnect: () => {
                    setStatus('Connecting');
                },
            });

            network.awareness?.setLocalStateField('user', user);

            setAwareness(network.awareness);
        } else {
            setStatus('Offline');
            setAwareness(null);
        }

        if (!isJoining) {
            // Sync the local state to the document, the server will receive it when the connection is established.
            connect();
        }

        return () => {
            isDisposed = true;

            synchronizer?.destroy();
            localUndoManager?.destroy();
            network?.destroy();
            document.destroy();
        };
    }, [dispatch, editorId, isLive]);

    const start = React.useCallback(() => {
        setRoom(editorId);
    }, [editorId]);

    const join = React.useCallback((name: string) => {
        joining.current = name;

        setRoom(name);
        dispatch(newDiagram(false, name));
    }, [dispatch]);

    const value = React.useMemo<CollaborationState>(() => ({
        awareness,
        isSupported: !!COLLABORATION_URL,
        join,
        room: isLive ? room : null,
        start,
        status,
        undoManager,
    }), [awareness, isLive, join, room, start, status, undoManager]);

    return (
        <CollaborationContext.Provider value={value}>
            {children}
        </CollaborationContext.Provider>
    );
};
