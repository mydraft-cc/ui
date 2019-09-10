import { Button } from 'antd';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import './LayoutProperties.scss';

import {
    ALIGN_H_CENTER,
    ALIGN_H_LEFT,
    ALIGN_H_RIGHT,
    ALIGN_V_BOTTOM,
    ALIGN_V_CENTER,
    ALIGN_V_TOP,
    alignItems,
    BRING_FORWARDS,
    BRING_TO_FRONT,
    DISTRIBUTE_H,
    DISTRIBUTE_V,
    getDiagramId,
    getSelectedItems,
    orderItems,
    SEND_BACKWARDS,
    SEND_TO_BACK,
    useStore
} from '@app/wireframes/model';

export const LayoutProperties = React.memo(() => {
    const dispatch = useDispatch();
    const selectedDiagramId = useStore(s => getDiagramId(s));
    const selectedItems = useStore(s => getSelectedItems(s));
    const canAlign = selectedItems.length > 1;
    const canOrder = selectedItems.length > 0;
    const canDistribute = selectedItems.length > 1;

    const doOrder = React.useCallback((mode: string) => {
        if (selectedDiagramId) {
            dispatch(orderItems(mode, selectedDiagramId, selectedItems));
        }
    }, [selectedDiagramId, selectedItems]);

    const doAlign = React.useCallback((mode: string) => {
        if (selectedDiagramId) {
            dispatch(alignItems(mode, selectedDiagramId, selectedItems));
        }
    }, [selectedDiagramId, selectedItems]);

    const doAlignHLeft   = React.useCallback(() => doAlign(ALIGN_H_LEFT), [doAlign]);
    const doAlignHCenter = React.useCallback(() => doAlign(ALIGN_H_CENTER), [doAlign]);
    const doAlignHRight  = React.useCallback(() => doAlign(ALIGN_H_RIGHT), [doAlign]);

    const doAlignVTop    = React.useCallback(() => doAlign(ALIGN_V_TOP), [doAlign]);
    const doAlignVCenter = React.useCallback(() => doAlign(ALIGN_V_CENTER), [doAlign]);
    const doAlignVBottom = React.useCallback(() => doAlign(ALIGN_V_BOTTOM), [doAlign]);

    const doDistributeH  = React.useCallback(() => doAlign(DISTRIBUTE_H), [doAlign]);
    const doDistributeV  = React.useCallback(() => doAlign(DISTRIBUTE_V), [doAlign]);

    const doBringToFront  = React.useCallback(() => doOrder(BRING_TO_FRONT), [doOrder]);
    const doBringForwards = React.useCallback(() => doOrder(BRING_FORWARDS), [doOrder]);
    const doSendBackwards = React.useCallback(() => doOrder(SEND_BACKWARDS), [doOrder]);
    const doSendToBack    = React.useCallback(() => doOrder(SEND_TO_BACK), [doOrder]);

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