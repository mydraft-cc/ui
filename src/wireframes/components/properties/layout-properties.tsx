import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Button } from 'antd';

import './layout-properties.scss';

import {
    ALIGN_H_CENTER,
    ALIGN_H_LEFT,
    ALIGN_H_RIGHT,
    ALIGN_V_BOTTOM,
    ALIGN_V_CENTER,
    ALIGN_V_TOP,
    BRING_FORWARDS,
    BRING_TO_FRONT,
    alignItems,
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
    canAlign:  boolean;

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
        canAlign: items.length >  1,
        canOrder: items.length > 0,
        canDistribute:  items.length > 1
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    orderItems, alignItems
}, dispatch);

const LayoutProperties = (props: LayoutPropertiesProps) => {
    const order = (mode: string) => {
        props.orderItems(mode, props.selectedDiagram!, props.selectedItems);
    };

    const align = (mode: string) => {
        props.alignItems(mode, props.selectedDiagram!, props.selectedItems);
    };

    return (
        <>
            {props.selectedDiagram &&
                <>
                    <div className='properties-subsection layout-properties'>
                        <Button disabled={!props.canAlign} onClick={() => align(ALIGN_H_LEFT)}>
                            <i className='icon-align-h-left' />
                        </Button>
                        <Button disabled={!props.canAlign} onClick={() => align(ALIGN_H_CENTER)}>
                            <i className='icon-align-h-center' />
                        </Button>
                        <Button disabled={!props.canAlign} onClick={() => align(ALIGN_H_RIGHT)}>
                            <i className='icon-align-h-right' />
                        </Button>

                        <Button disabled={!props.canAlign} onClick={() => align(ALIGN_V_TOP)}>
                            <i className='icon-align-v-top' />
                        </Button>
                        <Button disabled={!props.canAlign} onClick={() => align(ALIGN_V_CENTER)}>
                            <i className='icon-align-v-center' />
                        </Button>
                        <Button disabled={!props.canAlign} onClick={() => align(ALIGN_V_BOTTOM)}>
                            <i className='icon-align-v-bottom' />
                        </Button>
                        <Button disabled={!props.canDistribute} onClick={() => align(DISTRIBUTE_H)}>
                            <i className='icon-distribute-h2' />
                        </Button>
                        <Button disabled={!props.canDistribute} onClick={() => align(DISTRIBUTE_V)}>
                            <i className='icon-distribute-v2' />
                        </Button>
                    </div>

                    <div className='properties-subsection layout-properties'>
                        <Button disabled={!props.canOrder} onClick={() => order(BRING_TO_FRONT)}>
                            <i className='icon-bring-to-front' />
                        </Button>
                        <Button disabled={!props.canOrder} onClick={() => order(BRING_FORWARDS)}>
                            <i className='icon-bring-forwards' />
                        </Button>
                        <Button disabled={!props.canOrder} onClick={() => order(SEND_BACKWARDS)}>
                            <i className='icon-send-backwards'></i>
                        </Button>
                        <Button disabled={!props.canOrder} onClick={() => order(SEND_TO_BACK)}>
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