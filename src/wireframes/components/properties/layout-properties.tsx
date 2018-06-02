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

class LayoutProperties extends React.PureComponent<LayoutPropertiesProps> {
    private doOrder = (mode: string) => {
        this.props.orderItems(mode, this.props.selectedDiagram!, this.props.selectedItems);
    }

    private doAlign = (mode: string) => {
        this.props.alignItems(mode, this.props.selectedDiagram!, this.props.selectedItems);
    }

    private doAlignHLeft   = () => this.doAlign(ALIGN_H_LEFT);
    private doAlignHCenter = () => this.doAlign(ALIGN_H_CENTER);
    private doAlignHRight  = () => this.doAlign(ALIGN_H_RIGHT);

    private doAlignVTop    = () => this.doAlign(ALIGN_V_TOP);
    private doAlignVCenter = () => this.doAlign(ALIGN_V_CENTER);
    private doAlignVBottom = () => this.doAlign(ALIGN_V_BOTTOM);

    private doDistributeH  = () => this.doAlign(DISTRIBUTE_H);
    private doDistributeV  = () => this.doAlign(DISTRIBUTE_V);

    private doBringToFront  = () => this.doOrder(BRING_TO_FRONT);
    private doBringForwards = () => this.doOrder(BRING_FORWARDS);
    private doSendBackwards = () => this.doOrder(SEND_BACKWARDS);
    private doSendToBack    = () => this.doOrder(SEND_TO_BACK);

    public render() {
        return (
            <>
                {this.props.selectedDiagram &&
                    <>
                        <div className='properties-subsection layout-properties'>
                            <Button disabled={!this.props.canAlign} onClick={this.doAlignHLeft}>
                                <i className='icon-align-h-left' />
                            </Button>
                            <Button disabled={!this.props.canAlign} onClick={this.doAlignHCenter}>
                                <i className='icon-align-h-center' />
                            </Button>
                            <Button disabled={!this.props.canAlign} onClick={this.doAlignHRight}>
                                <i className='icon-align-h-right' />
                            </Button>

                            <Button disabled={!this.props.canAlign} onClick={this.doAlignVTop}>
                                <i className='icon-align-v-top' />
                            </Button>
                            <Button disabled={!this.props.canAlign} onClick={this.doAlignVCenter}>
                                <i className='icon-align-v-center' />
                            </Button>
                            <Button disabled={!this.props.canAlign} onClick={this.doAlignVBottom}>
                                <i className='icon-align-v-bottom' />
                            </Button>
                            <Button disabled={!this.props.canDistribute} onClick={this.doDistributeH}>
                                <i className='icon-distribute-h2' />
                            </Button>
                            <Button disabled={!this.props.canDistribute} onClick={this.doDistributeV}>
                                <i className='icon-distribute-v2' />
                            </Button>
                        </div>

                        <div className='properties-subsection layout-properties'>
                            <Button disabled={!this.props.canOrder} onClick={this.doBringToFront}>
                                <i className='icon-bring-to-front' />
                            </Button>
                            <Button disabled={!this.props.canOrder} onClick={this.doBringForwards}>
                                <i className='icon-bring-forwards' />
                            </Button>
                            <Button disabled={!this.props.canOrder} onClick={this.doSendBackwards}>
                                <i className='icon-send-backwards'></i>
                            </Button>
                            <Button disabled={!this.props.canOrder} onClick={this.doSendToBack}>
                                <i className='icon-send-to-back'></i>
                            </Button>
                        </div>
                    </>
                }
            </>
        );
    }
}

export const LayoutPropertiesContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(LayoutProperties);