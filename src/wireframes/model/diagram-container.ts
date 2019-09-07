import { List, Record } from 'immutable';

import {
    bringForwards,
    bringToFront,
    sendBackwards,
    sendToBack
} from '@app/core';

export class DiagramContainer extends Record<{ ids: List<string> }>({ ids: List<string>() }) {
    public static of(...ids: string[]) {
        return new DiagramContainer({ ids: List<string>(ids) });
    }

    public get values() {
        return this.get('ids').toArray();
    }

    public at(index: number) {
        return this.get('ids').get(index);
    }

    public push(...itemIds: string[]) {
        return this.replaceIds(ids => {
            return ids.withMutations(mutator => {
                for (let id of itemIds) {
                    mutator.push(id);
                }
            });
        });
    }

    public remove(...itemIds: string[]) {
        return this.replaceIds(ids => {
            return ids.withMutations(mutator => {
                for (let id of itemIds) {
                    mutator.remove(mutator.indexOf(id));
                }
            });
        });
    }

    public bringToFront(itemIds: string[]) {
        return this.replaceIds(ids => bringToFront(ids, itemIds));
    }

    public bringForwards(itemIds: string[]) {
        return this.replaceIds(ids => bringForwards(ids, itemIds));
    }

    public sendToBack(itemIds: string[]) {
        return this.replaceIds(ids => sendToBack(ids, itemIds));
    }

    public sendBackwards(itemIds: string[]) {
        return this.replaceIds(ids => sendBackwards(ids, itemIds));
    }

    private replaceIds(mutator: (ids: List<string>) => List<string>) {
        return this.set('ids', mutator(this.ids));
    }
}

export function createContainer() {
    return new DiagramContainer();
}