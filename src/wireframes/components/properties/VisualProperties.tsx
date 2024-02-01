/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Button, Col, Row, Select } from 'antd';
import * as React from 'react';
import { ColorPicker, useEventCallback } from '@app/core';
import { useAppDispatch } from '@app/store';
import { texts } from '@app/texts';
import { DefaultAppearance } from '@app/wireframes/interface';
import { getColors, getDiagramId, getSelection, selectColorTab, useStore } from '@app/wireframes/model';
import { UniqueValue, useAppearance, useColorAppearance } from './../actions';
import './VisualProperties.scss';

export const VisualProperties = React.memo(() => {
    const dispatch = useAppDispatch();
    const recentColors = useStore(getColors);
    const selectedColorTab = useStore(s => s.ui.selectedColorTab as any);
    const selectedDiagramId = useStore(getDiagramId);
    const selectionSet = useStore(getSelection);

    const [backgroundColor, setBackgroundColor] =
        useColorAppearance(selectedDiagramId, selectionSet,
            DefaultAppearance.BACKGROUND_COLOR);

    const [fontSize, setFontSize] =
        useAppearance<number>(selectedDiagramId, selectionSet,
            DefaultAppearance.FONT_SIZE);

    const [foregroundColor, setForegroundColor] =
        useColorAppearance(selectedDiagramId, selectionSet,
            DefaultAppearance.FOREGROUND_COLOR);

    const [strokeColor, setStrokeColor] =
        useColorAppearance(selectedDiagramId, selectionSet,
            DefaultAppearance.STROKE_COLOR);

    const [strokeThickness, setStrokeThickness] =
        useAppearance<number>(selectedDiagramId, selectionSet,
            DefaultAppearance.STROKE_THICKNESS);

    const [textAlignment, setTextAlignment] =
        useAppearance<string>(selectedDiagramId, selectionSet,
            DefaultAppearance.TEXT_ALIGNMENT);

    const doSelectColorTab = useEventCallback((key: string) => {
        dispatch(selectColorTab(key));
    });

    if (!selectedDiagramId) {
        return null;
    }

    return (
        <>
            <div style={{ display: (selectionSet.selectedItems.length > 0 ? 'block' : 'none') }}>
                <div className='property-subsection visual-properties'>
                    <Row className='property'>
                        <Col span={12} className='property-label'>{texts.common.fontSize}</Col>
                        <Col span={12} className='property-value'>
                            <Select disabled={fontSize.empty} value={fontSize.value} onChange={setFontSize}>
                                {DEFINED_FONT_SIZES.map(value =>
                                    <Select.Option key={value.toString()} value={value}>{value}</Select.Option>,
                                )}
                            </Select>
                        </Col>
                    </Row>
                    <Row className='property'>
                        <Col span={12} className='property-label'>{texts.common.strokeThickness}</Col>
                        <Col span={12} className='property-value'>
                            <Select disabled={strokeThickness.empty} value={strokeThickness.value} onChange={setStrokeThickness}>
                                {DEFINED_STROKE_THICKNESSES.map(value =>
                                    <Select.Option key={value.toString()} value={value}>{value}</Select.Option>,
                                )}
                            </Select>
                        </Col>
                    </Row>
                    <Row className='property'>
                        <Col span={12} className='property-label'>{texts.common.strokeColor}</Col>
                        <Col span={12} className='property-value'>
                            <ColorPicker activeColorTab={selectedColorTab} disabled={strokeColor.empty} value={strokeColor.value}
                                onChange={setStrokeColor}
                                onActiveColorTabChanged={doSelectColorTab}
                                recentColors={recentColors} />
                        </Col>
                    </Row>
                    <Row className='property'>
                        <Col span={12} className='property-label'>{texts.common.foregroundColor}</Col>
                        <Col span={12} className='property-value'>
                            <ColorPicker activeColorTab={selectedColorTab} disabled={foregroundColor.empty} value={foregroundColor.value}
                                onChange={setForegroundColor}
                                onActiveColorTabChanged={doSelectColorTab}
                                recentColors={recentColors} />
                        </Col>
                    </Row>
                    <Row className='property'>
                        <Col span={12} className='property-label'>{texts.common.backgroundColor}</Col>
                        <Col span={12} className='property-value'>
                            <ColorPicker activeColorTab={selectedColorTab} disabled={backgroundColor.empty} value={backgroundColor.value}
                                onChange={setBackgroundColor}
                                onActiveColorTabChanged={doSelectColorTab}
                                recentColors={recentColors} />
                        </Col>
                    </Row>
                    <Row className='property'>
                        <Col span={12} className='property-label'>{texts.common.textAlignment}</Col>
                        <Col span={12} className='property-value'>
                            <Button.Group className='text-alignment'>
                                <TextButton value={textAlignment} onClick={setTextAlignment}
                                    mode='left' icon='icon-align-left' />

                                <TextButton value={textAlignment} onClick={setTextAlignment}
                                    mode='center' icon='icon-align-center' />

                                <TextButton value={textAlignment} onClick={setTextAlignment}
                                    mode='right' icon='icon-align-right' />
                            </Button.Group>
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
});

type TextButtonProps = { mode: any; value: UniqueValue<any>; icon: string; onClick: (tag: any) => void };

const TextButton = React.memo(({ value, mode, icon, onClick }: TextButtonProps) => {
    const type = mode === value.value ? 'primary' : undefined;

    return (
        <Button disabled={value.empty} type={type} onClick={() => onClick(mode)}>
            <i className={icon} />
        </Button>
    );
});

const DEFINED_STROKE_THICKNESSES = [0, 1, 2, 4, 6, 8];
const DEFINED_FONT_SIZES = [4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 60];
