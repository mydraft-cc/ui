import {
    ImmutableList
} from '@app/core';

export class DiagramContainer extends ImmutableList<string> {
    public static readonly DEFAULT = new DiagramContainer([]);

    public static default() {
        return DiagramContainer.DEFAULT;
    }

    public static create(...ids: string[]) {
        return new DiagramContainer(ids);
    }
}