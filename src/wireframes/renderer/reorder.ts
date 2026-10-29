/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

type MoveBefore = (id: string, nextId: string | null) => void;

// Moves as few items as possible by keeping the longest subsequence that is already in the desired order.
export function reorder(current: ReadonlyArray<string>, desired: ReadonlyArray<string>, moveBefore: MoveBefore) {
    if (isSameOrder(current, desired)) {
        return;
    }

    const currentIndices = new Map<string, number>();
    for (let i = 0; i < current.length; i++) {
        currentIndices.set(current[i], i);
    }

    const positions: number[] = [];
    for (const id of desired) {
        positions.push(currentIndices.get(id) ?? -1);
    }

    const isStable = getLongestIncreasingSubsequence(positions);

    // Iterate backwards, so that the next item is always at its final position when an item is placed before it.
    for (let i = desired.length - 1; i >= 0; i--) {
        if (!isStable[i]) {
            moveBefore(desired[i], i + 1 < desired.length ? desired[i + 1] : null);
        }
    }
}

function isSameOrder(lhs: ReadonlyArray<string>, rhs: ReadonlyArray<string>) {
    if (lhs.length !== rhs.length) {
        return false;
    }

    for (let i = 0; i < lhs.length; i++) {
        if (lhs[i] !== rhs[i]) {
            return false;
        }
    }

    return true;
}

function getLongestIncreasingSubsequence(values: ReadonlyArray<number>) {
    const tails: number[] = [];
    const previous: number[] = [];

    for (let i = 0; i < values.length; i++) {
        const value = values[i];

        // Items that are not rendered yet can never be stable.
        if (value < 0) {
            previous.push(-1);
            continue;
        }

        let lo = 0;
        let hi = tails.length;
        while (lo < hi) {
            const mid = (lo + hi) >> 1;

            if (values[tails[mid]] < value) {
                lo = mid + 1;
            } else {
                hi = mid;
            }
        }

        previous.push(lo > 0 ? tails[lo - 1] : -1);
        tails[lo] = i;
    }

    const result = new Array<boolean>(values.length).fill(false);

    let index = tails.length > 0 ? tails[tails.length - 1] : -1;
    while (index >= 0) {
        result[index] = true;
        index = previous[index];
    }

    return result;
}
