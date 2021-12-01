/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

export function moveItems<T>(source: ReadonlyArray<T>, items: ReadonlyArray<T>, target: number, relative = false): ReadonlyArray<T> {
    if (source.length === 0 || !items || items.length === 0 || items.filter(x => !x).length > 0) {
        return source;
    }

    const itemsToStay: ItemToSort<T>[] = [];
    const itemsToMove: ItemToSort<T>[] = [];

    const allItems = [...source];

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
        return source;
    }

    let isBackwards = false;
    let newIndex = 0;

    if (relative) {
        isBackwards = target <= 0;

        let currentIndex =
            target > 0 ?
                Number.MIN_VALUE :
                Number.MAX_VALUE;

        for (const itemFromIds of itemsToMove) {
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

    for (const item of itemsToStay) {
        if ((isBackwards && item.index >= newIndex) || item.index > newIndex) {
            break;
        }

        newItems.push(item.value);
    }

    for (const item of itemsToMove) {
        newItems.push(item.value);
    }

    for (const item of itemsToStay) {
        if ((isBackwards && item.index >= newIndex) || item.index > newIndex) {
            newItems.push(item.value);
        }
    }

    return newItems;
}

type ItemToSort<T> = { isInItems: boolean; index: number; value: T };
