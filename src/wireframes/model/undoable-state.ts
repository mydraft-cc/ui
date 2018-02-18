export class UndoableState<T> {
    public get canUndo(): boolean {
        return this.past.length > 0;
    }

    public get canRedo(): boolean {
        return this.future.length > 0;
    }

    constructor(
        private readonly past: T[],
        private readonly pastCapacity: number,
        private readonly future: T[],
        public readonly present: T
    ) {
        Object.freeze(this);
    }

    public static create<T>(capacity: number, present: T) {
        return new UndoableState<T>([], capacity, [], present);
    }

    public undo(): UndoableState<T> {
        if (!this.canUndo) {
            return this;
        }

        const newPresent = this.past[this.past.length - 1];
        const newPast = this.past.slice(0, this.past.length - 1);
        const newFuture = [this.present, ...this.future];

        return new UndoableState(newPast, this.pastCapacity, newFuture, newPresent);
    }

    public redo(): UndoableState<T> {
        if (!this.canRedo) {
            return this;
        }

        const newPresent = this.future[0];
        const newPast = [...this.past, this.present];
        const newFuture = this.future.slice(1);

        return new UndoableState(newPast, this.pastCapacity, newFuture, newPresent);
    }

    public executed(present: T) {
        const newPast = [...this.past, this.present];

        if (newPast.length > this.pastCapacity) {
            newPast.splice(0, 1);
        }

        return new UndoableState(newPast, this.pastCapacity, [], present);
    }

    public replacePresent(present: T) {
        return new UndoableState(this.past, this.pastCapacity, this.future, present);
    }
}