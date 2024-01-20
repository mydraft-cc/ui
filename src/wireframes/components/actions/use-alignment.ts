/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable react-hooks/exhaustive-deps */

import * as React from 'react';
import { useEventCallback } from '@app/core';
import { useAppDispatch } from '@app/store';
import { texts } from '@app/texts';
import { alignItems, AlignmentMode, getDiagramId, getSelection, orderItems, OrderMode, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

export function useAlignment() {
    const dispatch = useAppDispatch();
    const selectedDiagramId = useStore(getDiagramId);
    const selectionSet = useStore(getSelection);
    const canAlign = selectionSet.selectedItems.length > 1;
    const canOrder = selectionSet.selectedItems.length > 0;
    const canDistribute = selectionSet.selectedItems.length > 2;

    const doAlign = useEventCallback((mode: AlignmentMode) => {
        if (selectedDiagramId) {
            dispatch(alignItems(mode, selectedDiagramId, selectionSet.selectedItems));
        }
    });

    const doOrder = useEventCallback((mode: OrderMode) => {
        if (selectedDiagramId) {
            dispatch(orderItems(mode, selectedDiagramId, selectionSet.selectedItems));
        }
    });

    function useAlign(mode: AlignmentMode, label: string, icon: string) {
        const action: UIAction = React.useMemo(() => ({
            disabled: !canAlign,
            icon,
            label,
            tooltip: label,
            onAction: () => doAlign(mode),
        }), [canAlign, doAlign]);

        return action;
    }

    function useDistribute(mode: AlignmentMode, label: string, icon: string) {
        const action: UIAction = React.useMemo(() => ({
            disabled: !canDistribute,
            icon,
            label,
            tooltip: label,
            onAction: () => doAlign(mode),
        }), [canAlign, doAlign]);

        return action;
    }

    function useOrder(mode: OrderMode, label: string, icon: string) {
        const action: UIAction = React.useMemo(() => ({
            context: mode,
            disabled: !canOrder,
            icon,
            label,
            tooltip: label,
            onAction: () => doOrder(mode),
        }), [canOrder, doOrder]);

        return action;
    }

    return {
        alignHorizontalCenter: useAlign(AlignmentMode.HorizontalCenter, texts.common.alignHorizontalCenter, 'icon-align-h-center'),
        alignHorizontalLeft: useAlign(AlignmentMode.HorizontalLeft, texts.common.alignHorizontalLeft, 'icon-align-h-left'),
        alignHorizontalRight: useAlign(AlignmentMode.HorizontalRight, texts.common.alignHorizontalRight, 'icon-align-h-right'),
        alignVerticalBottom: useAlign(AlignmentMode.VerticalBottom, texts.common.alignVerticalBottom, 'icon-align-v-bottom'),
        alignVerticalCenter: useAlign(AlignmentMode.VerticalCenter, texts.common.alignVerticalCenter, 'icon-align-v-center'),
        alignVerticalTop: useAlign(AlignmentMode.VerticalTop, texts.common.alignVerticalTop, 'icon-align-v-top'),
        bringForwards: useOrder(OrderMode.BringForwards, texts.common.bringForwards, 'icon-bring-forwards'),
        bringToFront: useOrder(OrderMode.BringToFront, texts.common.bringToFront, 'icon-bring-to-front'),
        distributeHorizontally: useDistribute(AlignmentMode.DistributeHorizontal, texts.common.distributeHorizontally, 'icon-distribute-h2'),
        distributeVertically: useDistribute(AlignmentMode.DistributeVertical, texts.common.distributeVertically, 'icon-distribute-v2'),
        sendBackwards: useOrder(OrderMode.SendBackwards, texts.common.sendBackwards, 'icon-send-backwards'),
        sendToBack: useOrder(OrderMode.SendToBack, texts.common.sendToBack, 'icon-send-to-back'),
    };
}
