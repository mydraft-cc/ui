/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Types } from '@app/core';
import { changeItemsAppearance, DiagramItemSet } from '@app/wireframes/model';
import * as React from 'react';
import { useDispatch } from 'react-redux';

export interface UIAction {
    // The label.
    label: string;

    // The icon.
    icon: JSX.Element | string;

    // The tooltip.
    tooltip: string;

    // The shortcut.
    shortcut?: string;

    // True when disabled.
    disabled: boolean;

    // The context value.
    context?: any;

    // The method to invoke the action.
    onAction: (context?: any) => void;
}

export type UniqueValue<TValue> = { value?: TValue; empty?: boolean };
export type UniqueParser<TInput> = (value: any) => TInput | undefined;

const DEFAULT_PARSER = (value: any) => value;

export function useAppearance<T>(diagramId: string, set: DiagramItemSet, key: string, parse?: UniqueParser<T>): [UniqueValue<T>, (value: T) => void] {
    const dispatch = useDispatch();

    const value = React.useMemo(() => {
        if (!set) {
            return { empty: true };
        }

        const parser = parse || DEFAULT_PARSER;

        let value: T | undefined;

        let empty = false;

        for (const visual of set!.allVisuals) {
            const appearance = visual.appearance.get(key);

            if (appearance) {
                empty = true;

                const parsed = parser(appearance);

                if (parsed && value && !Types.equals(value, parsed)) {
                    value = undefined;
                } else {
                    value = parsed;
                }
            }
        }

        return { value, empty };
    }, [parse, set, key]);

    const doChangeAppearance = React.useCallback((value: T) => {
        if (diagramId && set) {
            dispatch(changeItemsAppearance(diagramId, set.allVisuals, key, value));
        }
    }, [diagramId, dispatch, set, key]);

    return [value, doChangeAppearance];
}
