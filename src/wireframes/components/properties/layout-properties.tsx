import { Button } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import './layout-properties.scss';

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
    Diagram,
    DiagramItem,
    DISTRIBUTE_H,
    DISTRIBUTE_V,
    EditorState,
    getSelection,
    orderItems,
    SEND_BACKWARDS,
    SEND_TO_BACK,
    UndoableState
} from '@app/wireframes/model';

interface LayoutPropertiesProps {
    // The selected diagram.
    selectedDiagram: Diagram | null;

    // The selected items.
    selectedItems: DiagramItem[];

    // Indicates wherther the items can be aligned.
    canAlign: boolean;

    // Indicates whether the items can be ordered.
    canOrder: boolean;

    // Indicates whether the items can be distributed.
    canDistribute: boolean;

    // Orders the items.
    orderItems: (mode: string, diagram: Diagram, items: DiagramItem[]) => any;

    // Align the items.
    alignItems: (mode: string, diagram: Diagram, items: DiagramItem[]) => any;
}

const mapStateToProps = (state: { editor: UndoableState<EditorState> }) => {
    const { diagram, items } = getSelection(state);

    return {
        selectedDiagram: diagram,
        selectedItems: items,
        canAlign: items.length > 1,
        canOrder: items.length > 0,
        canDistribute: items.length > 1
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    orderItems, alignItems
}, dispatch);

const LayoutProperties = (props: LayoutPropertiesProps) => {
    const doOrder = (mode: string) => {
        props.orderItems(mode, props.selectedDiagram!, props.selectedItems);
    };

    const doAlign = (mode: string) => {
        props.alignItems(mode, props.selectedDiagram!, props.selectedItems);
    };

    const doAlignHLeft   = () => doAlign(ALIGN_H_LEFT);
    const doAlignHCenter = () => doAlign(ALIGN_H_CENTER);
    const doAlignHRight  = () => doAlign(ALIGN_H_RIGHT);

    const doAlignVTop    = () => doAlign(ALIGN_V_TOP);
    const doAlignVCenter = () => doAlign(ALIGN_V_CENTER);
    const doAlignVBottom = () => doAlign(ALIGN_V_BOTTOM);

    const doDistributeH  = () => doAlign(DISTRIBUTE_H);
    const doDistributeV  = () => doAlign(DISTRIBUTE_V);

    const doBringToFront  = () => doOrder(BRING_TO_FRONT);
    const doBringForwards = () => doOrder(BRING_FORWARDS);
    const doSendBackwards = () => doOrder(SEND_BACKWARDS);
    const doSendToBack    = () => doOrder(SEND_TO_BACK);

    return (
        <>
            {props.selectedDiagram &&
                <>
                    <div className='properties-subsection layout-properties'>
                        <Button disabled={!props.canAlign} onClick={doAlignHLeft}>
                            <i className='icon-align-h-left' />
                        </Button>
                        <Button disabled={!props.canAlign} onClick={doAlignHCenter}>
                            <i className='icon-align-h-center' />
                        </Button>
                        <Button disabled={!props.canAlign} onClick={doAlignHRight}>
                            <i className='icon-align-h-right' />
                        </Button>

                        <Button disabled={!props.canAlign} onClick={doAlignVTop}>
                            <i className='icon-align-v-top' />
                        </Button>
                        <Button disabled={!props.canAlign} onClick={doAlignVCenter}>
                            <i className='icon-align-v-center' />
                        </Button>
                        <Button disabled={!props.canAlign} onClick={doAlignVBottom}>
                            <i className='icon-align-v-bottom' />
                        </Button>
                        <Button disabled={!props.canDistribute} onClick={doDistributeH}>
                            <i className='icon-distribute-h2' />
                        </Button>
                        <Button disabled={!props.canDistribute} onClick={doDistributeV}>
                            <i className='icon-distribute-v2' />
                        </Button>
                    </div>

                    <div className='properties-subsection layout-properties'>
                        <Button disabled={!props.canOrder} onClick={doBringToFront}>
                            <i className='icon-bring-to-front' />
                        </Button>
                        <Button disabled={!props.canOrder} onClick={doBringForwards}>
                            <i className='icon-bring-forwards' />
                        </Button>
                        <Button disabled={!props.canOrder} onClick={doSendBackwards}>
                            <i className='icon-send-backwards'></i>
                        </Button>
                        <Button disabled={!props.canOrder} onClick={doSendToBack}>
                            <i className='icon-send-to-back'></i>
                        </Button>
                    </div>
                </>
            }
        </>
    );
};

export const LayoutPropertiesContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(LayoutProperties);