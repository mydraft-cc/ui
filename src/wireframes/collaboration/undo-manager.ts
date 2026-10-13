/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as Y from 'yjs';

type Listener = () => void;

// Reverts only the changes of the local user; local-only changes like the selection are not part of the history.
export class UndoManager {
    private readonly listeners: Listener[] = [];
    private readonly inner: Y.UndoManager;

    public get canUndo() {
        return this.inner.canUndo();
    }

    public get canRedo() {
        return this.inner.canRedo();
    }

    constructor(scope: Y.AbstractType<any>) {
        // Merges changes within this timespan, e.g. when moving a shape with the keyboard.
        this.inner = new Y.UndoManager(scope, { captureTimeout: 500 });
        this.inner.on('stack-item-added', this.notify);
        this.inner.on('stack-item-popped', this.notify);
        this.inner.on('stack-cleared', this.notify);
    }

    public undo() {
        this.inner.undo();
    }

    public redo() {
        this.inner.redo();
    }

    public destroy() {
        this.inner.destroy();
        this.listeners.length = 0;
    }

    public listen(listener: Listener) {
        this.listeners.push(listener);

        return () => {
            const index = this.listeners.indexOf(listener);

            if (index >= 0) {
                this.listeners.splice(index, 1);
            }
        };
    }

    private notify = () => {
        for (const listener of [...this.listeners]) {
            listener();
        }
    };
}
