export module Collections {
    export function withMovedTo<T>(source: T[], items: T[], target: number, relative = false): T[] {
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

        return newItems;
    }

    export function withAdded<T>(source: T[], items: T[], predicate?: (item: T) => boolean): T[] {
        if (!items || items.length === 0) {
            return source;
        }

        let newItems: T[] | null = null;

        for (let item of items) {
            if (!item || (predicate && !predicate(item))) {
                return source;
            }

            if (!newItems) {
                newItems = [...source];
            }

            newItems.push(item);
        }

        return newItems || source;
    }

    export function withRemoved<T>(source: T[], items: T[]): T[] {
        if (source.length === 0 || !items || items.length === 0) {
            return source;
        }

        let hasChanged = false;

        const newItems: T[] = [...source];

        for (let item of items) {
            if (!item) {
                return source;
            }

            const index = newItems.indexOf(item);

            if (index < 0) {
                return source;
            }

            newItems.splice(index, 1);

            hasChanged = true;
        }

        return hasChanged ? newItems : source;
    }

    export function withUpdated<T>(source: T[], items: T[], updater: (item: T) => T, predicate?: (lhs: T, rhs: T) => boolean): T[] {
        if (!items || items.length === 0 || source.length === 0 || !updater) {
            return source;
        }

        let newItems: T[] | null = null;

        for (let item of items) {
            if (!item) {
                return source;
            }

            const index = source.indexOf(item);

            if (index < 0) {
                return source;
            }

            const newItem = updater(item);

            if (!newItem) {
                return source;
            }

            if (newItem !== item) {
                if (predicate && !predicate(newItem, item)) {
                    return source;
                }

                if (newItems === null) {
                    newItems = [...source];
                }

                newItems[index] = newItem;
            }
        }

        return newItems || source;
    }
}

interface ItemToSort<T> { isInItems: boolean; index: number; value: T; }