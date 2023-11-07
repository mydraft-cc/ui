/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as Y from 'yjs';
import { selectDiagram, selectItems } from '@app/wireframes/model';

export class ExendedUndoManager {
    private readonly listeners: Function[] = [];
    private readonly undoStack: number[] = [];
    private readonly redoStack: number[] = [];
    private pendingActions = 0;

    public get canUndo() {
        return this.inner.canUndo;
    }

    public get canRedo() {
        return this.inner.canRedo;
    }

    constructor(
        private readonly inner: Y.UndoManager,
        private readonly getAction: () => any,
    ) {
        inner.on('stack-item-added', this.addHandler);
        inner.on('stack-item-popped', () => this.notify());
    }

    private addHandler = (event: { stackItem: any; type: 'undo' | 'redo' }) => {
        const action = this.getAction();

        if (action && (selectDiagram.match(action) || selectItems.match(action))) {
            this.pendingActions++;
            return;
        }

        const stack =
            event.type === 'redo' ?
                this.redoStack :
                this.undoStack;

        stack.push(this.pendingActions + 1);
        this.notify();

        this.pendingActions = 0;
    };

    public undo() {
        const numberOfActions = this.undoStack.pop() || 0;

        for (let i = 0; i < numberOfActions; i++) {
            this.inner.undo();
        }

        this.notify();
    }

    public redo() {
        const numberOfActions = this.redoStack.pop() || 0;

        for (let i = 0; i < numberOfActions; i++) {
            this.inner.redo();
        }

        this.notify();
    }

    public listen(listener: Function) {
        this.listeners.push(listener);

        return () => {
            this.listeners.splice(this.listeners.indexOf(listener) + 1);
        };
    }

    private notify() {
        for (const listener of this.listeners) {
            listener();
        }
    }
}