import { Button, Col, Row, Select } from 'antd';
import { ButtonType } from 'antd/lib/button';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import './visual-properties.scss';

import { Color, ColorPicker } from '@app/core';

import {
    changeItemsAppearance,
    DiagramItem,
    DiagramItemSet,
    DiagramShape,
    EditorStateInStore,
    getSelection,
    uniqueAppearance,
    UniqueValue
} from '@app/wireframes/model';

interface VisualPropertiesProps {
    // The selected diagram.
    selectedDiagramId: string | null;

    // The selected items.
    selectedItems: DiagramItem[];

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
}

const mapStateToProps = (state: EditorStateInStore) => {
    const { diagram, editor, items } = getSelection(state);

    let set: DiagramItemSet | null = null;

    if (diagram) {
        set = DiagramItemSet.createFromDiagram(diagram.selectedItemIds.toArray(), diagram);
    }

    return {
        selectedDiagramId: editor.selectedDiagramId,
        selectedItems: items,
        backgroundColor: uniqueAppearance(set, DiagramShape.APPEARANCE_BACKGROUND_COLOR, x => Color.fromValue(x), Color.eq),
        fontSize: uniqueAppearance(set, DiagramShape.APPEARANCE_FONT_SIZE, x => x),
        foregroundColor: uniqueAppearance(set, DiagramShape.APPEARANCE_FOREGROUND_COLOR, x => Color.fromValue(x), Color.eq),
        strokeColor: uniqueAppearance(set, DiagramShape.APPEARANCE_STROKE_COLOR, x => Color.fromValue(x), Color.eq),
        strokeThickness: uniqueAppearance(set, DiagramShape.APPEARANCE_STROKE_THICKNESS, x => x),
        textAlignment: uniqueAppearance(set, DiagramShape.APPEARANCE_TEXT_ALIGNMENT, x => x)
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    changeItemsAppearance
}, dispatch);

const DEFINED_STROKE_THICKNESSES = [1, 2, 4, 6, 8];
const DEFINED_FONT_SIZES = [4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 60];


const rowClass = (value: any) => 'property';

const VisualProperties = (props: VisualPropertiesProps) => {
    const alignTextType = (value: string): ButtonType => {
        return value === props.textAlignment.value ? 'primary' : undefined;
    };

    const doAlignText = (value: string) => {
        props.changeItemsAppearance(props.selectedDiagramId!, props.selectedItems, DiagramShape.APPEARANCE_TEXT_ALIGNMENT, value);
    };

    const doChangeAppearance = (key: string, value: any) => {
        props.changeItemsAppearance(props.selectedDiagramId!, props.selectedItems, key, value);
    };

    const doAlignTextLeft =   () => doAlignText('left');
    const doAlignTextCenter = () => doAlignText('center');
    const doAlignTextRight =  () => doAlignText('right');

    const doChangeFontSize =    	(value: any) => doChangeAppearance(DiagramShape.APPEARANCE_FONT_SIZE, value);
    const doChangeStrokeColor =     (value: any) => doChangeAppearance(DiagramShape.APPEARANCE_STROKE_COLOR, value);
    const doChangeStrokeThickness = (value: any) => doChangeAppearance(DiagramShape.APPEARANCE_STROKE_THICKNESS, value);
    const doChangeForegroundColor = (value: any) => doChangeAppearance(DiagramShape.APPEARANCE_FOREGROUND_COLOR, value);
    const doChangeBackgroundColor = (value: any) => doChangeAppearance(DiagramShape.APPEARANCE_BACKGROUND_COLOR, value);

    const fontSize = DEFINED_FONT_SIZES.map(o =>
        <Select.Option key={o.toString()} value={o}>{o}</Select.Option>
    );

    const strokeThicknesses = DEFINED_STROKE_THICKNESSES.map(o =>
        <Select.Option key={o.toString()} value={o}>{o}</Select.Option>
    );

    return (
        <>
            {props.selectedDiagramId &&
                <>
                    <div style={{display: (props.selectedItems.length > 0 ? 'block' : 'none') }}>
                        <div className='property-subsection visual-properties'>
                            <Row className={rowClass(props.fontSize)}>
                                <Col span={12} className='property-label'>
                                    Font Size
                            </Col>
                                <Col span={12} className='property-value'>
                                    <Select disabled={props.fontSize.empty} value={props.fontSize.value ? props.fontSize.value.toString() : undefined} onChange={doChangeFontSize}>
                                        {fontSize}
                                    </Select>
                                </Col>
                            </Row>
                            <Row className={rowClass(props.strokeThickness)}>
                                <Col span={12} className='property-label'>
                                    Stroke Thickness
                            </Col>
                                <Col span={12} className='property-value'>
                                    <Select disabled={props.strokeThickness.empty} value={props.strokeThickness.value ? props.strokeThickness.value.toString() : undefined} onChange={doChangeStrokeThickness}>
                                        {strokeThicknesses}
                                    </Select>
                                </Col>
                            </Row>
                            <Row className={rowClass(props.strokeColor)}>
                                <Col span={12} className='property-label'>
                                    Stroke Color
                            </Col>
                                <Col span={12} className='property-value'>
                                    <ColorPicker disabled={props.strokeColor.empty} value={props.strokeColor.value} onChange={doChangeStrokeColor} />
                                </Col>
                            </Row>
                            <Row className={rowClass(props.foregroundColor)}>
                                <Col span={12} className='property-label'>
                                    Foreground Color
                            </Col>
                                <Col span={12} className='property-value'>
                                    <ColorPicker disabled={props.foregroundColor.empty} value={props.foregroundColor.value} onChange={doChangeForegroundColor} />
                                </Col>
                            </Row>
                            <Row className={rowClass(props.backgroundColor)}>
                                <Col span={12} className='property-label'>
                                    Background Color
                                </Col>
                                <Col span={12} className='property-value'>
                                    <ColorPicker disabled={props.backgroundColor.empty} value={props.backgroundColor.value} onChange={doChangeBackgroundColor} />
                                </Col>
                            </Row>
                            <Row className={rowClass(props.textAlignment)}>
                                <Col span={12} className='property-label'>
                                    Text Alignment
                            </Col>
                                <Col span={12} className='property-value'>
                                    <Button.Group className='text-alignment'>
                                        <Button disabled={props.textAlignment.empty} type={alignTextType('left')} onClick={doAlignTextLeft}>
                                            <i className='icon-align-left' />
                                        </Button>
                                        <Button disabled={props.textAlignment.empty} type={alignTextType('center')} onClick={doAlignTextCenter}>
                                            <i className='icon-align-center' />
                                        </Button>
                                        <Button disabled={props.textAlignment.empty} type={alignTextType('right')} onClick={doAlignTextRight}>
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
};

export const VisualPropertiesContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(VisualProperties);