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
import { binder, EDITOR_SLICE, hasEditorState } from './binder';
import { UndoManager } from './undo-manager';
import { user } from './user';

const COLLABORATION_URL: string | undefined = import.meta.env.VITE_SERVER_COLLABORATION_URL;

// The provider keeps retrying, but after this time we tell the user that the server cannot be reached.
const UNREACHABLE_TIMEOUT_MS = 10_000;

export type CollaborationStatus = 'Offline' | 'Connecting' | 'Connected' | 'Unreachable';

export interface CollaborationState {
    // True, if collaboration is configured for this deployment.
    isSupported: boolean;

    // The name of the room, if the current diagram is shared live.
    room: string | null;

    // The connection status to the collaboration server.
    status: CollaborationStatus;

    // True, if the joined room has no content yet and we wait for the owner.
    isRoomEmpty: boolean;

    // The shared document, if the current diagram is shared live.
    document?: Y.Doc | null;

    // The undo manager, which only reverts local changes.
    undoManager?: UndoManager;

    // The awareness to share presence information with the other users.
    awareness?: Awareness | null;

    // Shares the current diagram live.
    start: () => void;

    // Opens the room with the given name.
    join: (room: string) => void;

    // Fills an empty room with a blank diagram instead of waiting for the owner.
    startEmpty: () => void;
}

export const CollaborationContext = React.createContext<CollaborationState>({
    isSupported: false,
    isRoomEmpty: false,
    room: null,
    status: 'Offline',
    start: () => {},
    join: () => {},
    startEmpty: () => {},
});

export const CollaborationProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useAppDispatch();
    const editorId = useStore(s => s.editor.id);
    const joining = React.useRef<string | null>(null);
    const connectEmpty = React.useRef<() => void>(() => {});
    const [room, setRoom] = React.useState<string | null>(null);
    const [status, setStatus] = React.useState<CollaborationStatus>('Offline');
    const [isRoomEmpty, setIsRoomEmpty] = React.useState(false);
    const [undoManager, setUndoManager] = React.useState<UndoManager>();
    const [awareness, setAwareness] = React.useState<Awareness | null>();
    const [liveDocument, setLiveDocument] = React.useState<Y.Doc | null>();

    const isLive = !!COLLABORATION_URL && room === editorId;

    React.useEffect(() => {
        const document = new Y.Doc();

        // Only the client that joins an existing room has to wait for the remote state.
        const isJoining = isLive && joining.current === editorId;

        let network: HocuspocusProvider | null = null;
        let synchronizer: ReturnType<typeof binder.connectSlice> | null = null;
        let localUndoManager: UndoManager | null = null;
        let unreachableTimer: ReturnType<typeof setTimeout> | undefined;
        let isDisposed = false;

        const connect = () => {
            if (isDisposed || synchronizer) {
                return;
            }

            // Only the live document that has waited for the remote state completes the join.
            if (isJoining) {
                joining.current = null;
            }

            document.off('update', connectWhenFilled);
            setIsRoomEmpty(false);

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

        // The owner of a room might still be offline, so we wait for the content instead of overwriting it with a blank diagram.
        const connectWhenFilled = () => {
            if (hasEditorState(document)) {
                connect();
            }
        };

        const waitForReachability = () => {
            clearTimeout(unreachableTimer);

            unreachableTimer = setTimeout(() => {
                if (!isDisposed) {
                    console.warn(`Collaboration server ${COLLABORATION_URL} is not reachable, retrying in the background.`);
                    setStatus('Unreachable');
                }
            }, UNREACHABLE_TIMEOUT_MS);
        };

        if (isLive) {
            setStatus('Connecting');
            waitForReachability();

            network = new HocuspocusProvider({
                url: COLLABORATION_URL!,
                name: editorId,
                document,
                onSynced: () => {
                    clearTimeout(unreachableTimer);
                    setStatus('Connected');

                    if (!isJoining || hasEditorState(document)) {
                        connect();
                    } else if (!synchronizer) {
                        setIsRoomEmpty(true);
                        document.on('update', connectWhenFilled);
                    }
                },
                onDisconnect: () => {
                    if (!isDisposed) {
                        setStatus(previous => previous === 'Unreachable' ? previous : 'Connecting');
                        waitForReachability();
                    }
                },
            });

            network.awareness?.setLocalStateField('user', user);

            setAwareness(network.awareness);
            setLiveDocument(document);
        } else {
            setStatus('Offline');
            setAwareness(null);
            setLiveDocument(null);
        }

        connectEmpty.current = connect;

        if (!isJoining) {
            // Sync the local state to the document, the server will receive it when the connection is established.
            connect();
        }

        return () => {
            isDisposed = true;

            clearTimeout(unreachableTimer);
            document.off('update', connectWhenFilled);
            setIsRoomEmpty(false);

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

    const startEmpty = React.useCallback(() => {
        connectEmpty.current();
    }, []);

    const value = React.useMemo<CollaborationState>(() => ({
        awareness,
        document: liveDocument,
        isRoomEmpty,
        isSupported: !!COLLABORATION_URL,
        join,
        room: isLive ? room : null,
        start,
        startEmpty,
        status,
        undoManager,
    }), [awareness, isLive, isRoomEmpty, join, liveDocument, room, start, startEmpty, status, undoManager]);

    return (
        <CollaborationContext.Provider value={value}>
            {children}
        </CollaborationContext.Provider>
    );
};
