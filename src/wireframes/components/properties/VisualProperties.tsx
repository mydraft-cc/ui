import { Button, Col, Row, Select } from 'antd';
import { ButtonType } from 'antd/lib/button';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import './VisualProperties.scss';

import { Color, ColorPicker } from '@app/core';

import {
    changeItemsAppearance,
    DiagramItem,
    getDiagramId,
    getSelectedItems,
    getSelectionSet,
    selectColorTab,
    uniqueAppearance,
    useStore
} from '@app/wireframes/model';

const DEFINED_STROKE_THICKNESSES = [1, 2, 4, 6, 8];
const DEFINED_FONT_SIZES = [4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 60];

export const VisualProperties = React.memo(() => {
    const dispatch = useDispatch();
    const selectionSet = useStore(s => getSelectionSet(s));
    const selectedColorTab = useStore(s => s.ui.selectedColorTab);
    const selectedDiagramId = useStore(s => getDiagramId(s));
    const selectedItems = useStore(s => getSelectedItems(s));

    const backgroundColor = React.useMemo(() =>
        uniqueAppearance(selectionSet, DiagramItem.APPEARANCE_BACKGROUND_COLOR, x => Color.fromValue(x), Color.eq)
    , [selectionSet]);

    const fontSize = React.useMemo(() =>
        uniqueAppearance(selectionSet, DiagramItem.APPEARANCE_FONT_SIZE, x => x)
    , [selectionSet]);

    const foregroundColor = React.useMemo(() =>
        uniqueAppearance(selectionSet, DiagramItem.APPEARANCE_FOREGROUND_COLOR, x => Color.fromValue(x), Color.eq)
    , [selectionSet]);

    const strokeColor = React.useMemo(() =>
        uniqueAppearance(selectionSet, DiagramItem.APPEARANCE_STROKE_COLOR, x => Color.fromValue(x), Color.eq)
    , [selectionSet]);

    const strokeThickness = React.useMemo(() =>
        uniqueAppearance(selectionSet, DiagramItem.APPEARANCE_STROKE_THICKNESS, x => x)
    , [selectionSet]);

    const textAlignment = React.useMemo(() =>
        uniqueAppearance(selectionSet, DiagramItem.APPEARANCE_TEXT_ALIGNMENT, x => x)
    , [selectionSet]);

    const getTextAlignment = React.useCallback((value: string): ButtonType => {
        return value === textAlignment.value ? 'primary' : undefined;
    }, [textAlignment]);

    const doAlignText = React.useCallback((value: string) => {
        if (selectedDiagramId) {
            dispatch(changeItemsAppearance(selectedDiagramId, selectedItems, DiagramItem.APPEARANCE_TEXT_ALIGNMENT, value));
        }
    }, [selectedDiagramId, selectedItems]);

    const doChangeAppearance = React.useCallback((key: string, value: any) => {
        if (selectedDiagramId) {
            dispatch(changeItemsAppearance(selectedDiagramId, selectedItems, key, value));
        }
    }, [selectedDiagramId, selectedItems]);

    const doSelectColorTab = React.useCallback((key: string) => {
        dispatch(selectColorTab(key));
    }, []);

    const doAlignTextLeft =   React.useCallback(() => doAlignText('left'), [doAlignText]);
    const doAlignTextCenter = React.useCallback(() => doAlignText('center'), [doAlignText]);
    const doAlignTextRight =  React.useCallback(() => doAlignText('right'), [doAlignText]);

    const doChangeFontSize =    	React.useCallback((value: any) => doChangeAppearance(DiagramItem.APPEARANCE_FONT_SIZE, value), [doChangeAppearance]);
    const doChangeStrokeColor =     React.useCallback((value: any) => doChangeAppearance(DiagramItem.APPEARANCE_STROKE_COLOR, value), [doChangeAppearance]);
    const doChangeStrokeThickness = React.useCallback((value: any) => doChangeAppearance(DiagramItem.APPEARANCE_STROKE_THICKNESS, value), [doChangeAppearance]);
    const doChangeForegroundColor = React.useCallback((value: any) => doChangeAppearance(DiagramItem.APPEARANCE_FOREGROUND_COLOR, value), [doChangeAppearance]);
    const doChangeBackgroundColor = React.useCallback((value: any) => doChangeAppearance(DiagramItem.APPEARANCE_BACKGROUND_COLOR, value), [doChangeAppearance]);

    if (!selectedDiagramId) {
        return null;
    }

    const fontSizes = DEFINED_FONT_SIZES.map(o =>
        <Select.Option key={o.toString()} value={o}>{o}</Select.Option>
    );

    const strokeThicknesses = DEFINED_STROKE_THICKNESSES.map(o =>
        <Select.Option key={o.toString()} value={o}>{o}</Select.Option>
    );

    return (
        <>
            <div style={{display: (selectedItems.length > 0 ? 'block' : 'none') }}>
                <div className='property-subsection visual-properties'>
                    <Row className='property'>
                        <Col span={12} className='property-label'>Font Size</Col>
                        <Col span={12} className='property-value'>
                            <Select disabled={fontSize.empty} value={fontSize.value ? fontSize.value.toString() : undefined} onChange={doChangeFontSize}>
                                {fontSizes}
                            </Select>
                        </Col>
                    </Row>
                    <Row className='property'>
                        <Col span={12} className='property-label'>Stroke Thickness</Col>
                        <Col span={12} className='property-value'>
                            <Select disabled={strokeThickness.empty} value={strokeThickness.value ? strokeThickness.value.toString() : undefined} onChange={doChangeStrokeThickness}>
                                {strokeThicknesses}
                            </Select>
                        </Col>
                    </Row>
                    <Row className='property'>
                        <Col span={12} className='property-label'>Stroke Color</Col>
                        <Col span={12} className='property-value'>
                            <ColorPicker activeColorTab={selectedColorTab} disabled={strokeColor.empty} value={strokeColor.value}
                                onChange={doChangeStrokeColor}
                                onActiveColorTabChanged={doSelectColorTab} />
                        </Col>
                    </Row>
                    <Row className='property'>
                        <Col span={12} className='property-label'>Foreground Color</Col>
                        <Col span={12} className='property-value'>
                            <ColorPicker activeColorTab={selectedColorTab} disabled={foregroundColor.empty} value={foregroundColor.value}
                                onChange={doChangeForegroundColor}
                                onActiveColorTabChanged={doSelectColorTab} />
                        </Col>
                    </Row>
                    <Row className='property'>
                        <Col span={12} className='property-label'>Background Color</Col>
                        <Col span={12} className='property-value'>
                            <ColorPicker activeColorTab={selectedColorTab} disabled={backgroundColor.empty} value={backgroundColor.value}
                                onChange={doChangeBackgroundColor}
                                onActiveColorTabChanged={doSelectColorTab} />
                        </Col>
                    </Row>
                    <Row className='property'>
                        <Col span={12} className='property-label'>Text Alignment</Col>
                        <Col span={12} className='property-value'>
                            <Button.Group className='text-alignment'>
                                <Button disabled={textAlignment.empty} type={getTextAlignment('left')} onClick={doAlignTextLeft}>
                                    <i className='icon-align-left' />
                                </Button>
                                <Button disabled={textAlignment.empty} type={getTextAlignment('center')} onClick={doAlignTextCenter}>
                                    <i className='icon-align-center' />
                                </Button>
                                <Button disabled={textAlignment.empty} type={getTextAlignment('right')} onClick={doAlignTextRight}>
                                    <i className='icon-align-right' />
                                </Button>
                            </Button.Group>
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
});