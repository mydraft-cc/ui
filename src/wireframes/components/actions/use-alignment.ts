/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

/* eslint-disable react-hooks/exhaustive-deps */

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useEventCallback } from '@app/core';
import { texts } from '@app/texts';
import { alignItems, AlignmentMode, getDiagramId, getSelectedItems, orderItems, OrderMode, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

export function useAlignment() {
    const dispatch = useDispatch();
    const selectedDiagramId = useStore(getDiagramId);
    const selectedItems = useStore(getSelectedItems);
    const canAlign = selectedItems.length > 1;
    const canDistribute = selectedItems.length > 2;
    const canOrder = selectedItems.length > 0;

    const doAlign = useEventCallback((mode: AlignmentMode) => {
        if (selectedDiagramId) {
            dispatch(alignItems(mode, selectedDiagramId, selectedItems));
        }
    });

    const doOrder = useEventCallback((mode: OrderMode) => {
        if (selectedDiagramId) {
            dispatch(orderItems(mode, selectedDiagramId, selectedItems));
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
