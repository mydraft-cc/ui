export abstract class ImmutableObject {
    public abstract clone(): ImmutableObject;

    protected afterClone(prev?: any) {
        return;
    }

    protected cloned<T extends ImmutableObject>(updater: (instance: ImmutableObject) => void) {
        let objCloned = <T>this.clone();

        updater(objCloned);

        objCloned.afterClone(this);
        Object.freeze(objCloned);

        return objCloned;
    }
}