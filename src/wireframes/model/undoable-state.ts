interface State<T> {
    state: T;
    action?: any;
}

export class UndoableState<T> {
    public get canUndo(): boolean {
        return this.past.length > 0;
    }

    public get canRedo(): boolean {
        return this.future.length > 0;
    }

    public get present(): T {
        return this.presentState.state;
    }

    public get actions(): any[] {
        return [...this.past.map(s => s.action), this.presentState.action].filter(x => !!x);
    }

    private constructor(
        private readonly past: State<T>[],
        private readonly pastCapacity: number,
        private readonly future: State<T>[],
        private readonly presentState: State<T>
    ) {
        Object.freeze(this);
    }

    public static create<T>(present: T, action?: any, capacity = Number.MAX_VALUE) {
        return new UndoableState<T>([], capacity, [], { state: present, action });
    }

    public undo(): UndoableState<T> {
        if (!this.canUndo) {
            return this;
        }

        const newPresent = this.past[this.past.length - 1];
        const newPast    = this.past.slice(0, this.past.length - 1);

        const newFuture  = [this.presentState, ...this.future];

        return new UndoableState(newPast, this.pastCapacity, newFuture, newPresent);
    }

    public redo(): UndoableState<T> {
        if (!this.canRedo) {
            return this;
        }

        const newPresent = this.future[0];
        const newFuture  = this.future.slice(1);

        const newPast    = [...this.past, this.presentState];

        return new UndoableState(newPast, this.pastCapacity, newFuture, newPresent);
    }

    public executed(state: T, action?: any) {
        const newPast = [...this.past, this.presentState];

        if (newPast.length > this.pastCapacity) {
            newPast.splice(0, 1);
        }

        return new UndoableState(newPast, this.pastCapacity, [], { state, action });
    }

    public replacePresent(state: T) {
        return new UndoableState(this.past, this.pastCapacity, this.future, { state, action: this.presentState.action });
    }
}