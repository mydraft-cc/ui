/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable one-var */
/* eslint-disable one-var-declaration-per-line */

import { Color, Types } from '@app/core';
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

    // The method to invoke the action.
    onAction: () => void;
}

export type UniqueValue<TValue> = { value?: TValue; empty?: boolean };
export type UniqueConverter<TInput> = { parse: (value: any) => TInput; write: (value: TInput) => any };

const DEFAULT_CONVERTER = {
    parse: (value: any) => {
        return value;
    },
    write: (value: any) => {
        return value;
    },
};

const COLOR_CONVERTER: UniqueConverter<Color> = {
    parse: (value: any) => {
        return Color.fromValue(value);
    },
    write: (value: Color) => {
        return value.toString();
    },
};

export function useColorAppearance(diagramId: string | null | undefined, set: DiagramItemSet | null | undefined, key: string): [UniqueValue<Color>, (value: Color) => void] {
    return useAppearanceCore(diagramId, set, key, COLOR_CONVERTER);
}

export function useAppearance<T>(diagramId: string | null | undefined, set: DiagramItemSet | null | undefined, key: string): [UniqueValue<T>, (value: T) => void] {
    return useAppearanceCore(diagramId, set, key, DEFAULT_CONVERTER);
}

export function useAppearanceCore<T>(diagramId: string | null | undefined, set: DiagramItemSet | null | undefined, key: string, converter: UniqueConverter<T>): [UniqueValue<T>, (value: T) => void] {
    const dispatch = useDispatch();

    const value = React.useMemo(() => {
        if (!set) {
            return { empty: true };
        }

        let value: T | undefined, empty = true;

        for (const visual of set!.allVisuals) {
            const appearance = visual.appearance.get(key);

            if (!Types.isUndefined(appearance)) {
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
    }, [converter, set, key]);

    const doChangeAppearance = React.useCallback((value: T) => {
        if (diagramId && set) {
            dispatch(changeItemsAppearance(diagramId, set.allVisuals, key, converter.write(value)));
        }
    }, [converter, diagramId, dispatch, set, key]);

    return [value, doChangeAppearance];
}
