import { Button, Col, Row, Select } from 'antd';
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
    EditorState,
    getSelection,
    UndoableState
} from '@app/wireframes/model';

interface VisualPropertiesProps {
    // The selected diagram.
    selectedDiagramId: string;

    // The selected items.
    selectedItems: DiagramItem[];

    // The common font size.
    fontSize: number;

    // The common stroke thickness.
    strokeThickness: number;

    // The common stroke color.
    strokeColor: Color;

    // The common foreground color.
    foregroundColor: Color;

    // The common background color.
    backgroundColor: Color;

    // The text alignment.
    textAlignment: string;

    // Orders the items.
    changeItemsAppearance: (diagram: string, items: DiagramItem[], key: string, val: any) => any;
}

const mapStateToProps = (state: { editor: UndoableState<EditorState> }) => {
    const { diagram, editor, items } = getSelection(state);

    let set: DiagramItemSet | null = null;

    function uniqueAppearance<T>(key: string, parse: (i: any) => T, compare: (l: T, r: T) => boolean) {
        if (!diagram) {
            return undefined;
        }

        if (set === null) {
            set = DiagramItemSet.createFromDiagram(diagram!.selectedItemIds.toArray(), diagram);
        }

        let result: T | undefined = undefined;

        for (let visual of set!.allVisuals) {
            const appearance = parse(visual.appearance.get(key));

            if (appearance && result && !compare(result, appearance)) {
                return undefined;
            }

            result = appearance;

        }

        return result;
    }

    return {
        selectedDiagramId: editor.selectedDiagramId,
        selectedItems: items,
        backgroundColor: uniqueAppearance(DiagramShape.APPEARANCE_BACKGROUND_COLOR, x => Color.fromValue(x), (l, r) => l.eq(r)),
        fontSize: uniqueAppearance(DiagramShape.APPEARANCE_FONT_SIZE, x => x, (l, r) => l !== r),
        foregroundColor: uniqueAppearance(DiagramShape.APPEARANCE_FOREGROUND_COLOR, x => Color.fromValue(x), (l, r) => l.eq(r)),
        strokeColor: uniqueAppearance(DiagramShape.APPEARANCE_STROKE_COLOR, x => Color.fromValue(x), (l, r) => l.eq(r)),
        strokeThickness: uniqueAppearance(DiagramShape.APPEARANCE_STROKE_THICKNESS, x => x, (l, r) => l !== r),
        textAlignment: uniqueAppearance(DiagramShape.APPEARANCE_TEXT_ALIGNMENT, x => x, (l, r) => l !== r)
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    changeItemsAppearance
}, dispatch);

const DEFINED_STROKE_THICKNESSES = [1, 2, 4, 6, 8];
const DEFINED_FONT_SIZES = [4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 60];

const VisualProperties = (props: VisualPropertiesProps) => {
    const alignTextType = (value: string) => {
        return value === props.textAlignment ? 'primary' : undefined;
    };

    const doAlignText = (value: string) => {
        props.changeItemsAppearance(props.selectedDiagramId, props.selectedItems, DiagramShape.APPEARANCE_TEXT_ALIGNMENT, value);
    };

    const doChangeAppearance = (key: string, value: any) => {
        props.changeItemsAppearance(props.selectedDiagramId, props.selectedItems, DiagramShape.APPEARANCE_FONT_SIZE, value);
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
        <Select.Option key={o} value={o}>{o}</Select.Option>
    );

    const strokeThicknesses = DEFINED_STROKE_THICKNESSES.map(o =>
        <Select.Option key={o} value={o}>{o}</Select.Option>
    );

    return (
        <>
            <div style={{display: (props.selectedItems.length > 0 ? 'block' : 'none') }}>
                <div className='property-subsection visual-properties'>
                    <Row className='property'>
                        <Col span={12} className='property-label'>
                            Font Size
                    </Col>
                        <Col span={12} className='property-value'>
                            <Select value={props.fontSize ? props.fontSize.toString() : undefined} onChange={doChangeFontSize}>
                                {fontSize}
                            </Select>
                        </Col>
                    </Row>
                    <Row className='property'>
                        <Col span={12} className='property-label'>
                            Stroke Thickness
                    </Col>
                        <Col span={12} className='property-value'>
                            <Select value={props.strokeThickness ? props.strokeThickness.toString() : undefined} onChange={doChangeStrokeThickness}>
                                {strokeThicknesses}
                            </Select>
                        </Col>
                    </Row>
                    <Row className='property'>
                        <Col span={12} className='property-label'>
                            Stroke Color
                    </Col>
                        <Col span={12} className='property-value'>
                            <ColorPicker value={props.strokeColor} onChange={doChangeStrokeColor} />
                        </Col>
                    </Row>
                    <Row className='property'>
                        <Col span={12} className='property-label'>
                            Foreground Color
                    </Col>
                        <Col span={12} className='property-value'>
                            <ColorPicker value={props.foregroundColor} onChange={doChangeForegroundColor} />
                        </Col>
                    </Row>
                    <Row className='property'>
                        <Col span={12} className='property-label'>
                            Background Color
                    </Col>
                        <Col span={12} className='property-value'>
                            <ColorPicker value={props.backgroundColor} onChange={doChangeBackgroundColor} />
                        </Col>
                    </Row>
                    <Row className='property'>
                        <Col span={12} className='property-label'>
                            Text Alignment
                    </Col>
                        <Col span={12} className='property-value'>
                            <Button.Group className='text-alignment'>
                                <Button type={alignTextType('left')} onClick={doAlignTextLeft}>
                                    <i className='icon-align-left' />
                                </Button>
                                <Button type={alignTextType('center')} onClick={doAlignTextCenter}>
                                    <i className='icon-align-center' />
                                </Button>
                                <Button type={alignTextType('right')} onClick={doAlignTextRight}>
                                    <i className='icon-align-right' />
                                </Button>
                            </Button.Group>
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
};

export const VisualPropertiesContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(VisualProperties);