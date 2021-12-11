/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { alignItems, AlignmentMode, getDiagramId, getSelectedItems, orderItems, OrderMode, useStore } from '@app/wireframes/model';
import { Button } from 'antd';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import './LayoutProperties.scss';

export const LayoutProperties = React.memo(() => {
    const dispatch = useDispatch();
    const selectedDiagramId = useStore(getDiagramId);
    const selectedItems = useStore(getSelectedItems);
    const canAlign = selectedItems.length > 1;
    const canOrder = selectedItems.length > 0;
    const canDistribute = selectedItems.length > 1;

    const doOrder = React.useCallback((mode: OrderMode) => {
        if (selectedDiagramId) {
            dispatch(orderItems(mode, selectedDiagramId, selectedItems));
        }
    }, [dispatch, selectedDiagramId, selectedItems]);

    const doAlign = React.useCallback((mode: AlignmentMode) => {
        if (selectedDiagramId) {
            dispatch(alignItems(mode, selectedDiagramId, selectedItems));
        }
    }, [dispatch, selectedDiagramId, selectedItems]);

    const doAlignHLeft = React.useCallback(() => doAlign(AlignmentMode.HorizontalLeft), [doAlign]);
    const doAlignHCenter = React.useCallback(() => doAlign(AlignmentMode.HorizontalCenter), [doAlign]);
    const doAlignHRight = React.useCallback(() => doAlign(AlignmentMode.HorizontalRight), [doAlign]);

    const doAlignVTop = React.useCallback(() => doAlign(AlignmentMode.VerticalTop), [doAlign]);
    const doAlignVCenter = React.useCallback(() => doAlign(AlignmentMode.VerticalCenter), [doAlign]);
    const doAlignVBottom = React.useCallback(() => doAlign(AlignmentMode.VerticalBottom), [doAlign]);

    const doDistributeH = React.useCallback(() => doAlign(AlignmentMode.DistributeHorizontal), [doAlign]);
    const doDistributeV = React.useCallback(() => doAlign(AlignmentMode.DistributeVertical), [doAlign]);

    const doBringToFront = React.useCallback(() => doOrder(OrderMode.BringToFront), [doOrder]);
    const doBringForwards = React.useCallback(() => doOrder(OrderMode.BringForwards), [doOrder]);
    const doSendBackwards = React.useCallback(() => doOrder(OrderMode.SendBackwards), [doOrder]);
    const doSendToBack = React.useCallback(() => doOrder(OrderMode.SendToBack), [doOrder]);

    if (!selectedDiagramId) {
        return null;
    }

    return (
        <>
            <div className='properties-subsection layout-properties'>
                <Button disabled={!canAlign} onClick={doAlignHLeft}>
                    <i className='icon-align-h-left' />
                </Button>
                <Button disabled={!canAlign} onClick={doAlignHCenter}>
                    <i className='icon-align-h-center' />
                </Button>
                <Button disabled={!canAlign} onClick={doAlignHRight}>
                    <i className='icon-align-h-right' />
                </Button>

                <Button disabled={!canAlign} onClick={doAlignVTop}>
                    <i className='icon-align-v-top' />
                </Button>
                <Button disabled={!canAlign} onClick={doAlignVCenter}>
                    <i className='icon-align-v-center' />
                </Button>
                <Button disabled={!canAlign} onClick={doAlignVBottom}>
                    <i className='icon-align-v-bottom' />
                </Button>
                <Button disabled={!canDistribute} onClick={doDistributeH}>
                    <i className='icon-distribute-h2' />
                </Button>
                <Button disabled={!canDistribute} onClick={doDistributeV}>
                    <i className='icon-distribute-v2' />
                </Button>
            </div>

            <div className='properties-subsection layout-properties'>
                <Button disabled={!canOrder} onClick={doBringToFront}>
                    <i className='icon-bring-to-front' />
                </Button>
                <Button disabled={!canOrder} onClick={doBringForwards}>
                    <i className='icon-bring-forwards' />
                </Button>
                <Button disabled={!canOrder} onClick={doSendBackwards}>
                    <i className='icon-send-backwards'></i>
                </Button>
                <Button disabled={!canOrder} onClick={doSendToBack}>
                    <i className='icon-send-to-back'></i>
                </Button>
            </div>
        </>
    );
});
