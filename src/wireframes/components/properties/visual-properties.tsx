import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Button, Col, Row, Select } from 'antd';

import './visual-properties.scss';

import { Color, ColorPicker } from '@app/core';

import {
    changeItemsAppearance,
    Diagram,
    DiagramItem,
    DiagramItemSet,
    DiagramShape,
    EditorState,
    getSelection,
    UndoableState
} from '@app/wireframes/model';

interface VisualPropertiesProps {
    // The selected diagram.
    selectedDiagram: Diagram | null;

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
    changeItemsAppearance: (diagram: Diagram, items: DiagramItem[], key: string, val: any) => any;
}

const mapStateToProps = (state: { editor: UndoableState<EditorState> }) => {
    const { diagram, items } = getSelection(state);

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
        selectedDiagram: diagram,
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

class VisualProperties extends React.PureComponent<VisualPropertiesProps> {
    private alignTextType = (value: string) => {
        return value === this.props.textAlignment ? 'primary' : undefined;
    }

    private doAlignText = (value: string) => {
        this.props.changeItemsAppearance(this.props.selectedDiagram!, this.props.selectedItems, DiagramShape.APPEARANCE_TEXT_ALIGNMENT, value);
    }

    private doChangeAppearance = (key: string, value: any) => {
        this.props.changeItemsAppearance(this.props.selectedDiagram!, this.props.selectedItems, DiagramShape.APPEARANCE_FONT_SIZE, value);
    }

    private doAlignTextLeft = () => this.doAlignText('left');
    private doAlignTextCenter = () =>  this.doAlignText('center');
    private doAlignTextRight = () => this.doAlignText('right');

    private doChangeFontSize = (value: any) => this.doChangeAppearance(DiagramShape.APPEARANCE_FONT_SIZE, value);
    private doChangeStrokeColor = (value: any) => this.doChangeAppearance(DiagramShape.APPEARANCE_STROKE_COLOR, value);
    private doChangeStrokeThickness = (value: any) => this.doChangeAppearance(DiagramShape.APPEARANCE_STROKE_THICKNESS, value);
    private doChangeForegroundColor = (value: any) => this.doChangeAppearance(DiagramShape.APPEARANCE_FOREGROUND_COLOR, value);
    private doChangeBackgroundColor = (value: any) => this.doChangeAppearance(DiagramShape.APPEARANCE_BACKGROUND_COLOR, value);

    private fontSize = DEFINED_FONT_SIZES.map(o =>
        <Select.Option key={o} value={o}>{o}</Select.Option>
    );

    private strokeThicknesses = DEFINED_STROKE_THICKNESSES.map(o =>
        <Select.Option key={o} value={o}>{o}</Select.Option>
    );

    public render() {
        return (
            <>
                {this.props.selectedDiagram && this.props.selectedItems.length > 0 &&
                    <>
                        <div className='property-subsection visual-properties'>
                            <Row className='property'>
                                <Col span={12} className='property-label'>
                                    Font Size
                            </Col>
                                <Col span={12} className='property-value'>
                                    <Select value={this.props.fontSize ? this.props.fontSize.toString() : undefined} onChange={this.doChangeFontSize}>
                                        {this.fontSize}
                                    </Select>
                                </Col>
                            </Row>
                            <Row className='property'>
                                <Col span={12} className='property-label'>
                                    Stroke Thickness
                            </Col>
                                <Col span={12} className='property-value'>
                                    <Select value={this.props.strokeThickness ? this.props.strokeThickness.toString() : undefined} onChange={this.doChangeStrokeThickness}>
                                        {this.strokeThicknesses}
                                    </Select>
                                </Col>
                            </Row>
                            <Row className='property'>
                                <Col span={12} className='property-label'>
                                    Stroke Color
                            </Col>
                                <Col span={12} className='property-value'>
                                    <ColorPicker value={this.props.strokeColor} onChange={this.doChangeStrokeColor} />
                                </Col>
                            </Row>
                            <Row className='property'>
                                <Col span={12} className='property-label'>
                                    Foreground Color
                            </Col>
                                <Col span={12} className='property-value'>
                                    <ColorPicker value={this.props.foregroundColor} onChange={this.doChangeForegroundColor} />
                                </Col>
                            </Row>
                            <Row className='property'>
                                <Col span={12} className='property-label'>
                                    Background Color
                            </Col>
                                <Col span={12} className='property-value'>
                                    <ColorPicker value={this.props.backgroundColor} onChange={this.doChangeBackgroundColor} />
                                </Col>
                            </Row>
                            <Row className='property'>
                                <Col span={12} className='property-label'>
                                    Text Alignment
                            </Col>
                                <Col span={12} className='property-value'>
                                    <Button.Group className='text-alignment'>
                                        <Button type={this.alignTextType('left')} onClick={this.doAlignTextLeft}>
                                            <i className='icon-align-left' />
                                        </Button>
                                        <Button type={this.alignTextType('center')} onClick={this.doAlignTextCenter}>
                                            <i className='icon-align-center' />
                                        </Button>
                                        <Button type={this.alignTextType('right')} onClick={this.doAlignTextRight}>
                                            <i className='icon-align-right' />
                                        </Button>
                                    </Button.Group>
                                </Col>
                            </Row>
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