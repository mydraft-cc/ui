import { Button, Col, Row, Select } from 'antd';
import { ButtonType } from 'antd/lib/button';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import './VisualProperties.scss';

import { Color, ColorPicker } from '@app/core';

import {
    changeItemsAppearance,
    DiagramItem,
    DiagramShape,
    EditorStateInStore,
    getDiagramId,
    getSelectedItems,
    getSelectionSet,
    selectColorTab,
    UIStateInStore,
    uniqueAppearance,
    UniqueValue
} from '@app/wireframes/model';

interface VisualPropertiesProps {
    // The selected diagram.
    selectedDiagramId: string | null;

    // The selected items.
    selectedItems: DiagramItem[];

    // The selected color tab.
    selectedColorTab: string;

    // The common font size.
    fontSize: UniqueValue<number>;

    // The common stroke thickness.
    strokeThickness: UniqueValue<number>;

    // The common stroke color.
    strokeColor: UniqueValue<Color>;

    // The common foreground color.
    foregroundColor: UniqueValue<Color>;

    // The common background color.
    backgroundColor: UniqueValue<Color>;

    // The text alignment.
    textAlignment: UniqueValue<string>;

    // Orders the items.
    changeItemsAppearance: (diagram: string, items: DiagramItem[], key: string, val: any) => any;

    // Selectes the color tab.
    selectColorTab: (key: string) => any;
}

const mapStateToProps = (state: EditorStateInStore & UIStateInStore) => {
    const set = getSelectionSet(state);

    return {
        selectedDiagramId: getDiagramId(state),
        selectedItems: getSelectedItems(state),
        backgroundColor: uniqueAppearance(set, DiagramShape.APPEARANCE_BACKGROUND_COLOR, x => Color.fromValue(x), Color.eq),
        fontSize: uniqueAppearance(set, DiagramShape.APPEARANCE_FONT_SIZE, x => x),
        foregroundColor: uniqueAppearance(set, DiagramShape.APPEARANCE_FOREGROUND_COLOR, x => Color.fromValue(x), Color.eq),
        strokeColor: uniqueAppearance(set, DiagramShape.APPEARANCE_STROKE_COLOR, x => Color.fromValue(x), Color.eq),
        strokeThickness: uniqueAppearance(set, DiagramShape.APPEARANCE_STROKE_THICKNESS, x => x),
        textAlignment: uniqueAppearance(set, DiagramShape.APPEARANCE_TEXT_ALIGNMENT, x => x),
        selectedColorTab: state.ui.selectedColorTab
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    changeItemsAppearance, selectColorTab
}, dispatch);

const DEFINED_STROKE_THICKNESSES = [1, 2, 4, 6, 8];
const DEFINED_FONT_SIZES = [4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 60];

class VisualProperties extends React.PureComponent<VisualPropertiesProps> {
    private textAlignment = (value: string): ButtonType => {
        return value === this.props.textAlignment.value ? 'primary' : undefined;
    }

    private doAlignText = (value: string) => {
        const selectedDiagramId = this.props.selectedDiagramId;

        if (selectedDiagramId) {
            this.props.changeItemsAppearance(selectedDiagramId, this.props.selectedItems, DiagramShape.APPEARANCE_TEXT_ALIGNMENT, value);
        }
    }

    private doChangeAppearance = (key: string, value: any) => {
        const selectedDiagramId = this.props.selectedDiagramId;

        if (selectedDiagramId) {
            this.props.changeItemsAppearance(selectedDiagramId, this.props.selectedItems, key, value);
        }
    }

    private doSelectColorTab = (key: string) => {
        this.props.selectColorTab(key);
    }

    private doAlignTextLeft =   () => this.doAlignText('left');
    private doAlignTextCenter = () => this.doAlignText('center');
    private doAlignTextRight =  () => this.doAlignText('right');

    private doChangeFontSize =    	  (value: any) => this.doChangeAppearance(DiagramShape.APPEARANCE_FONT_SIZE, value);
    private doChangeStrokeColor =     (value: any) => this.doChangeAppearance(DiagramShape.APPEARANCE_STROKE_COLOR, value);
    private doChangeStrokeThickness = (value: any) => this.doChangeAppearance(DiagramShape.APPEARANCE_STROKE_THICKNESS, value);
    private doChangeForegroundColor = (value: any) => this.doChangeAppearance(DiagramShape.APPEARANCE_FOREGROUND_COLOR, value);
    private doChangeBackgroundColor = (value: any) => this.doChangeAppearance(DiagramShape.APPEARANCE_BACKGROUND_COLOR, value);

    private fontSizes = DEFINED_FONT_SIZES.map(o =>
        <Select.Option key={o.toString()} value={o}>{o}</Select.Option>
    );

    private strokeThicknesses = DEFINED_STROKE_THICKNESSES.map(o =>
        <Select.Option key={o.toString()} value={o}>{o}</Select.Option>
    );

    public render() {
        const {
            backgroundColor,
            fontSize,
            foregroundColor,
            selectedColorTab,
            selectedDiagramId,
            selectedItems,
            strokeColor,
            strokeThickness,
            textAlignment
        } = this.props;

        return (
            <>
                {selectedDiagramId &&
                    <>
                        <div style={{display: (selectedItems.length > 0 ? 'block' : 'none') }}>
                            <div className='property-subsection visual-properties'>
                                <Row className='property'>
                                    <Col span={12} className='property-label'>
                                        Font Size
                                </Col>
                                    <Col span={12} className='property-value'>
                                        <Select disabled={fontSize.empty} value={fontSize.value ? fontSize.value.toString() : undefined} onChange={this.doChangeFontSize}>
                                            {this.fontSizes}
                                        </Select>
                                    </Col>
                                </Row>
                                <Row className='property'>
                                    <Col span={12} className='property-label'>
                                        Stroke Thickness
                                </Col>
                                    <Col span={12} className='property-value'>
                                        <Select disabled={strokeThickness.empty} value={strokeThickness.value ? strokeThickness.value.toString() : undefined} onChange={this.doChangeStrokeThickness}>
                                            {this.strokeThicknesses}
                                        </Select>
                                    </Col>
                                </Row>
                                <Row className='property'>
                                    <Col span={12} className='property-label'>
                                        Stroke Color
                                </Col>
                                    <Col span={12} className='property-value'>
                                        <ColorPicker activeColorTab={selectedColorTab} disabled={strokeColor.empty} value={strokeColor.value}
                                            onChange={this.doChangeStrokeColor}
                                            onActiveColorTabChanged={this.doSelectColorTab} />
                                    </Col>
                                </Row>
                                <Row className='property'>
                                    <Col span={12} className='property-label'>
                                        Foreground Color
                                </Col>
                                    <Col span={12} className='property-value'>
                                        <ColorPicker activeColorTab={selectedColorTab} disabled={foregroundColor.empty} value={foregroundColor.value}
                                            onChange={this.doChangeForegroundColor}
                                            onActiveColorTabChanged={this.doSelectColorTab} />
                                    </Col>
                                </Row>
                                <Row className='property'>
                                    <Col span={12} className='property-label'>
                                        Background Color
                                    </Col>
                                    <Col span={12} className='property-value'>
                                        <ColorPicker activeColorTab={selectedColorTab} disabled={backgroundColor.empty} value={backgroundColor.value}
                                            onChange={this.doChangeBackgroundColor}
                                            onActiveColorTabChanged={this.doSelectColorTab} />
                                    </Col>
                                </Row>
                                <Row className='property'>
                                    <Col span={12} className='property-label'>
                                        Text Alignment
                                    </Col>
                                    <Col span={12} className='property-value'>
                                        <Button.Group className='text-alignment'>
                                            <Button disabled={textAlignment.empty} type={this.textAlignment('left')} onClick={this.doAlignTextLeft}>
                                                <i className='icon-align-left' />
                                            </Button>
                                            <Button disabled={textAlignment.empty} type={this.textAlignment('center')} onClick={this.doAlignTextCenter}>
                                                <i className='icon-align-center' />
                                            </Button>
                                            <Button disabled={textAlignment.empty} type={this.textAlignment('right')} onClick={this.doAlignTextRight}>
                                                <i className='icon-align-right' />
                                            </Button>
                                        </Button.Group>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </>
                }
            </>
        );
    }
}

export const VisualPropertiesContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(VisualProperties);