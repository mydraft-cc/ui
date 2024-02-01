/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable one-var */
/* eslint-disable one-var-declaration-per-line */

import * as React from 'react';
import { Color, Types, useEventCallback } from '@app/core';
import { useAppDispatch } from '@app/store';
import { changeItemsAppearance, DiagramItemSet } from '@app/wireframes/model';

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

    // The method to invoke the action.
    onAction: () => void;
}

export type UniqueValue<TValue> = { value?: TValue; empty?: boolean };
export type UniqueConverter<TInput> = { parse: (value: any) => TInput; write: (value: TInput) => any };

const DEFAULT_CONVERTER = {
    parse: (value: any) => {
        if (value === 'undefined') {
            return undefined!;
        }

        return value;
    },
    write: (value: any) => {
        return value;
    },
};

const COLOR_CONVERTER: UniqueConverter<Color> = {
    parse: (value: any) => {
        if (value === 'undefined') {
            return undefined!;
        }

        return Color.fromValue(value);
    },
    write: (value: Color) => {
        return value.toString();
    },
};

type Result<T> = [UniqueValue<T>, (value: T) => void];

type RefDiagramId = string | null | undefined;
type RefDiagramItemSet = DiagramItemSet | null | undefined;

export function useColorAppearance(selectedDiagramId: RefDiagramId, selectedSet: RefDiagramItemSet, key: string): Result<Color> {
    return useAppearanceCore(selectedDiagramId, selectedSet, key, COLOR_CONVERTER);
}

export function useAppearance<T>(selectedDiagramId: RefDiagramId, selectedSet: RefDiagramItemSet, key: string, allowUndefined = false, force = false): Result<T> {
    return useAppearanceCore(selectedDiagramId, selectedSet, key, DEFAULT_CONVERTER, allowUndefined, force);
}

export function useAppearanceCore<T>(selectedDiagramId: RefDiagramId, selectionSet: RefDiagramItemSet, key: string, converter: UniqueConverter<T>, allowUndefined = false, force = false): Result<T> {
    const dispatch = useAppDispatch();

    const value = React.useMemo(() => {
        if (!selectionSet) {
            return { empty: true };
        }

        let value: T | undefined, empty = true;

        for (const item of selectionSet.nested.values()) {
            if (item.type === 'Group') {
                continue;
            }
    
            const appearance = item.appearance.get(key);

            if (!Types.isUndefined(appearance) || allowUndefined) {
                empty = false;

                const parsed = converter.parse(appearance);

                if (parsed && value && !Types.equals(value, parsed)) {
                    value = undefined;
                } else {
                    value = parsed;
                }
            }
        }

        return { value, empty };
    }, [allowUndefined, converter, key, selectionSet]);

    const doChangeAppearance = useEventCallback((value: T) => {
        if (selectedDiagramId && selectionSet) {
            dispatch(changeItemsAppearance(selectedDiagramId, selectionSet.deepEditableItems, key, converter.write(value), force));
        }
    });

    return [value, doChangeAppearance];
}
