/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as Y from 'yjs';
import { user, User } from '@app/wireframes/user';

export interface CollaborationState {
    // The main document.
    document?: Y.Doc;

    // The actual provider.
    provider?: { awareness: awarenessProtocol.Awareness; destroy: () => void };

    // The undo managher
    undoManager?: Y.UndoManager;
}

export const CollaborationContext = React.createContext<CollaborationState>({});

export const useUndoManager = () => {
    const undoManager = React.useContext(CollaborationContext).undoManager;
    const [canUndo, setCanUndo] = React.useState(false);
    const [canRedo, setCanRedo] = React.useState(false);

    React.useEffect(() => {
        if (!undoManager) {
            return () => { };
        }

        const handler = () => {
            setCanUndo(undoManager.canUndo());
            setCanRedo(undoManager.canRedo());
        };

        undoManager.on('stack-item-added', handler);
        undoManager.on('stack-item-popped', handler);

        return () => {
            undoManager.off('stack-item-added', handler);
            undoManager.off('stack-item-popped', handler);
        };
    }, [undoManager]);

    const undo = React.useCallback(() => {
        undoManager?.undo();
    }, [undoManager]);

    const redo = React.useCallback(() => {
        undoManager?.redo();
    }, [undoManager]);

    return { canRedo, canUndo, redo, undo };
};

export function usePresence(): Record<string, User> {
    const provider = React.useContext(CollaborationContext).provider;
    const [presence, setPresence] = React.useState<Record<string, User>>({});

    React.useEffect(() => {
        if (!provider?.awareness) {
            return () => {};
        }

        const roomName = provider['roomName'];

        if (roomName) {
            console.log(`Connecting presence to room name '${roomName}'.`);
        }

        const handler = () => {
            const map: Record<string, User> = {};

            provider.awareness.getStates().forEach(state => {
                if (Object.keys(state).length > 0) {
                    const user = state as User;

                    map[user.id] = user;
                }
            });

            setPresence(map);
        };

        provider.awareness.on('change', handler);
        provider.awareness.setLocalState(user);

        return () => {
            provider.awareness.off('change', handler);
        };
    }, [provider]);

    return presence;
}