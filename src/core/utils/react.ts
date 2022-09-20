/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';

export const sizeInPx = (value: number) => {
    return `${value}px`;
};

type Fn<ARGS extends any[], R> = (...args: ARGS) => R;

export const useEventCallback = <A extends any[], R>(fn: Fn<A, R>): Fn<A, R> => {
    let ref = React.useRef<Fn<A, R>>(fn);

    React.useLayoutEffect(() => {
        ref.current = fn;
    });

    return React.useMemo(() => (...args: A): R => {
        return ref.current(...args);
    }, []);
};