/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { Shortcut, useEventCallback } from '@app/core';
import { useAppDispatch } from '@app/store';
import { calculateSelection, getDiagram, selectItems, useStore } from '@app/wireframes/model';
import { ActionMenuButton, useGrouping, useRemove } from './../actions';

export const ArrangeMenu = React.memo(() => {
    const dispatch = useAppDispatch();
    const forRemvoe = useRemove();
    const forGrouping = useGrouping();
    const selectedDiagram = useStore(getDiagram);

    const doSelectAll = useEventCallback(() => {
        if (selectedDiagram) {
            const selection =
                calculateSelection(
                    selectedDiagram.items.values,
                    selectedDiagram);

            dispatch(selectItems(selectedDiagram, selection));
        }
    });

    return (
        <>
            <ActionMenuButton action={forGrouping.group} />
            <ActionMenuButton action={forGrouping.ungroup} />

            <Shortcut disabled={forRemvoe.remove.disabled} onPressed={forRemvoe.remove.onAction} keys='del' />
            <Shortcut disabled={forRemvoe.remove.disabled} onPressed={forRemvoe.remove.onAction} keys='backspace' />

            <Shortcut disabled={!selectedDiagram} onPressed={doSelectAll} keys='MOD + A' />
        </>
    );
});
