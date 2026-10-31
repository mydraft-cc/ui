/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { CollaborationContext } from './CollaborationProvider';
import { user as currentUser, User } from './user';
import { getVersions, Version, VERSIONS_ROOT } from './versions';

export function useCollaboration() {
    return React.useContext(CollaborationContext);
}

export function useUndoManager() {
    const { undoManager } = useCollaboration();
    const [canUndo, setCanUndo] = React.useState(false);
    const [canRedo, setCanRedo] = React.useState(false);

    React.useEffect(() => {
        const update = () => {
            setCanUndo(!!undoManager?.canUndo);
            setCanRedo(!!undoManager?.canRedo);
        };

        update();

        return undoManager?.listen(update);
    }, [undoManager]);

    const undo = React.useCallback(() => {
        undoManager?.undo();
    }, [undoManager]);

    const redo = React.useCallback(() => {
        undoManager?.redo();
    }, [undoManager]);

    return { canRedo, canUndo, redo, undo };
}

export function usePresence(): ReadonlyArray<User> {
    const { awareness } = useCollaboration();
    const [users, setUsers] = React.useState<ReadonlyArray<User>>([]);

    React.useEffect(() => {
        if (!awareness) {
            setUsers([]);
            return undefined;
        }

        const update = () => {
            const result: User[] = [];
            const seen = new Set<string>();

            awareness.getStates().forEach(state => {
                const user = state['user'] as User | undefined;

                // The same user can be connected from multiple tabs.
                if (user?.id && user.id !== currentUser.id && !seen.has(user.id)) {
                    seen.add(user.id);
                    result.push(user);
                }
            });

            setUsers(previous => {
                if (previous.length === result.length && previous.every((x, i) => x.id === result[i].id)) {
                    return previous;
                }

                return result;
            });
        };

        update();

        awareness.on('change', update);

        return () => {
            awareness.off('change', update);
        };
    }, [awareness]);

    return users;
}

export function useVersions(): ReadonlyArray<Version> {
    const { document } = useCollaboration();
    const [versions, setVersions] = React.useState<ReadonlyArray<Version>>([]);

    React.useEffect(() => {
        if (!document) {
            setVersions([]);
            return undefined;
        }

        const array = document.getArray<Version>(VERSIONS_ROOT);

        const update = () => {
            setVersions(getVersions(document));
        };

        update();

        array.observe(update);

        return () => {
            array.unobserve(update);
        };
    }, [document]);

    return versions;
}
