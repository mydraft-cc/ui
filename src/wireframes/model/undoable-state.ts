/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Action } from 'redux';

interface State<T> {
    state: T;
    action?: any;
}

export class UndoableState<T> {
    public get firstState() {
        return this.past[0]?.state || this.presentState.state;
    }

    public get canUndo() {
        return this.past.length > 0;
    }

    public get canRedo() {
        return this.future.length > 0;
    }

    public get present() {
        return this.presentState.state;
    }

    public get lastAction() {
        return this.presentState.action;
    }

    public get actions(): ReadonlyArray<Action> {
        const results = this.past.map(s => s.action).filter(x => !!x);

        if (this.presentState.action) {
            results.push(this.presentState.action);
        }

        return results;
    }

    private constructor(
        private readonly past: State<T>[],
        private readonly pastCapacity: number,
        private readonly future: State<T>[],
        private readonly presentState: State<T>,
    ) {
        Object.freeze(this);
    }

    public static create<T>(present: T, action?: Action, capacity = 50) {
        return new UndoableState<T>([], capacity, [], { state: present, action });
    }

    public undo(): UndoableState<T> {
        if (!this.canUndo) {
            return this;
        }

        const newPresent = this.past[this.past.length - 1];
        const newPast = this.past.slice(0, this.past.length - 1);

        const newFuture = [this.presentState, ...this.future];

        return new UndoableState(newPast, this.pastCapacity, newFuture, newPresent);
    }

    public redo(): UndoableState<T> {
        if (!this.canRedo) {
            return this;
        }

        const newPresent = this.future[0];
        const newFuture = this.future.slice(1);

        const newPast = [...this.past, this.presentState];

        return new UndoableState(newPast, this.pastCapacity, newFuture, newPresent);
    }

    public executed(state: T, action?: Action) {
        const newPresent = { state, action };
        const newPast = [...this.past, this.presentState];

        if (newPast.length > this.pastCapacity) {
            newPast.splice(0, 1);
        }

        return new UndoableState(newPast, this.pastCapacity, [], newPresent);
    }

    public replacePresent(state: T, action?: Action) {
        const newPresent = { state, action: action || this.presentState.action };

        return new UndoableState(this.past, this.pastCapacity, this.future, newPresent);
    }
}
