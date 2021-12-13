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

    const doAlign = React.useCallback((mode: AlignmentMode) => {
        if (selectedDiagramId) {
            dispatch(alignItems(mode, selectedDiagramId, selectedItems));
        }
    }, [dispatch, selectedDiagramId, selectedItems]);

    const doOrder = React.useCallback((mode: OrderMode) => {
        if (selectedDiagramId) {
            dispatch(orderItems(mode, selectedDiagramId, selectedItems));
        }
    }, [dispatch, selectedDiagramId, selectedItems]);

    if (!selectedDiagramId) {
        return null;
    }

    return (
        <>
            <div className='properties-subsection layout-properties'>
                <LayoutButton disabled={!canAlign} onClick={doAlign}
                    mode={AlignmentMode.HorizontalLeft} icon='icon-align-h-left' />

                <LayoutButton disabled={!canAlign} onClick={doAlign}
                    mode={AlignmentMode.HorizontalCenter} icon='icon-align-h-center' />

                <LayoutButton disabled={!canAlign} onClick={doAlign}
                    mode={AlignmentMode.HorizontalRight} icon='icon-align-h-right' />

                <LayoutButton disabled={!canAlign} onClick={doAlign}
                    mode={AlignmentMode.VerticalTop} icon='icon-align-v-top' />

                <LayoutButton disabled={!canAlign} onClick={doAlign}
                    mode={AlignmentMode.VerticalCenter} icon='icon-align-v-center' />

                <LayoutButton disabled={!canAlign} onClick={doAlign}
                    mode={AlignmentMode.VerticalBottom} icon='icon-align-v-bottom' />

                <LayoutButton disabled={!canDistribute} onClick={doAlign}
                    mode={AlignmentMode.DistributeHorizontal} icon='icon-distribute-h2' />

                <LayoutButton disabled={!canDistribute} onClick={doAlign}
                    mode={AlignmentMode.DistributeVertical} icon='icon-distribute-v2' />
            </div>

            <div className='properties-subsection layout-properties'>

                <LayoutButton disabled={!canOrder} onClick={doOrder}
                    mode={OrderMode.BringToFront} icon='icon-bring-to-front' />

                <LayoutButton disabled={!canOrder} onClick={doOrder}
                    mode={OrderMode.BringForwards} icon='icon-bring-forwards' />

                <LayoutButton disabled={!canOrder} onClick={doOrder}
                    mode={OrderMode.SendBackwards} icon='icon-send-backwards' />

                <LayoutButton disabled={!canOrder} onClick={doOrder}
                    mode={OrderMode.SendToBack} icon='icon-send-to-back' />
            </div>
        </>
    );
});

type LayoutButtonProps = { disabled: boolean; mode: any; icon: string; onClick: (tag: any) => void };

const LayoutButton = React.memo(({ disabled, mode, icon, onClick }: LayoutButtonProps) => {
    return (
        <Button disabled={disabled} onClick={() => onClick(mode)}>
            <i className={icon} />
        </Button>
    );
});
