import { List, Map } from 'immutable';

export function updateWhenFound<K, V>(map: Map<K, V>, key: K, updater: (v: V) => V) {
    if (!map.has(key)) {
        return map;
    }

    return map.update(key, updater);
}

export function singleOrDefault<T>(iterable: Iterable<T>): T {
    let itemFound = false;
    let item: T;

    for (let i of iterable) {
        if (!itemFound) {
            item = i;
            itemFound = true;
        } else {
            break;
        }
    }

    return itemFound ? item : undefined;
}

export function bringToFront<T>(list: List<T>, items: T[]) {
    return moveTo(list, items, Number.MAX_VALUE);
}

export function bringForwards<T>(list: List<T>, items: T[]) {
    return moveTo(list, items, 1, true);
}

export function sendBackwards<T>(list: List<T>, items: T[]) {
    return moveTo(list, items, -1, true);
}

export function sendToBack<T>(list: List<T>, items: T[]) {
    return moveTo(list, items, 0);
}

type ItemToSort<T> = { isInItems: boolean; index: number; value: T; };

export function moveTo<T>(list: List<T>, items: T[], target: number, relative = false): List<T> {
    if (list.size === 0) {
        return list;
    }

    const itemsToStay: ItemToSort<T>[] = [];
    const itemsToMove: ItemToSort<T>[] = [];

    const allItems = [...list.toArray()];

    for (let i = 0; i < allItems.length; i++) {
        const item = allItems[i];

        const itemToAdd: ItemToSort<T> = { isInItems: items && items.indexOf(item) >= 0, index: i, value: item };

        if (itemToAdd.isInItems) {
            itemsToMove.push(itemToAdd);
        } else {
            itemsToStay.push(itemToAdd);
        }
    }

    if (itemsToMove.length === 0) {
        return list;
    }

    let isBackwards = false, newIndex = 0;

    if (relative) {
        isBackwards = target <= 0;

        let currentIndex =
            target > 0 ?
                Number.MIN_VALUE :
                Number.MAX_VALUE;

        for (let itemFromIds of itemsToMove) {
            if (target > 0) {
                currentIndex = Math.max(itemFromIds.index, currentIndex);
            } else {
                currentIndex = Math.min(itemFromIds.index, currentIndex);
            }
        }

        newIndex = currentIndex + target;
    } else {
        newIndex = target;

        if (itemsToMove[0].index > newIndex) {
            isBackwards = true;
        }
    }

    const newItems: T[] = [];

    for (let item of itemsToStay) {
        if ((isBackwards && item.index >= newIndex) || item.index > newIndex) {
            break;
        }

        newItems.push(item.value);
    }

    for (let item of itemsToMove) {
        newItems.push(item.value);
    }

    for (let item of itemsToStay) {
        if ((isBackwards && item.index >= newIndex) || item.index > newIndex) {
            newItems.push(item.value);
        }
    }

    return List.of(...newItems);
}