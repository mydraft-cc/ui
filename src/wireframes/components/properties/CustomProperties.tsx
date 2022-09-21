/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Col, InputNumber, Row, Select } from 'antd';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Color, ColorPicker, useEventCallback } from '@app/core';
import { changeItemsAppearance, ColorConfigurable, Configurable, getDiagramId, getSelectedConfigurables, getSelectedShape, NumberConfigurable, selectColorTab, SelectionConfigurable, SliderConfigurable, useStore } from '@app/wireframes/model';
import { CustomSlider } from './CustomSlider';

interface CustomPropertyProps {
    // The configurable.
    configurable: Configurable;

    // The appearance value.
    value: any;

    // The selected color tab.
    selectedColorTab: string;

    // When the value has changed.
    onChange: (name: string, value: any) => void;

    // The color tab has changed.
    onColorTabChange: (key: string) => void;
}

export const CustomProperty = (props: CustomPropertyProps) => {
    const {
        configurable,
        onChange,
        onColorTabChange,
        selectedColorTab,
        value,
    } = props;

    const doChangeValue = useEventCallback((newValue: any) => {
        onChange(configurable.name, newValue);
    });

    const doChangeColor = useEventCallback((color: Color) => {
        onChange(configurable.name, color.toNumber());
    });

    return (
        <Row className='property'>
            <Col span={12} className='property-label'>
                {configurable.label}
            </Col>
            <Col span={12} className='property-value'>
                {configurable instanceof SliderConfigurable &&
                    <CustomSlider value={value}
                        min={configurable.min}
                        max={configurable.max}
                        onChange={doChangeValue} />
                }
                {configurable instanceof NumberConfigurable &&
                    <InputNumber value={value}
                        min={configurable.min}
                        max={configurable.max}
                        onChange={doChangeValue} />
                }
                {configurable instanceof SelectionConfigurable &&
                    <Select value={value}
                        onChange={doChangeValue}
                    >
                        {configurable.options.map(o =>
                            <Select.Option key={o} value={o}>{o}</Select.Option>,
                        )}
                    </Select>
                }
                {configurable instanceof ColorConfigurable &&
                    <ColorPicker activeColorTab={selectedColorTab as any} value={value}
                        onChange={doChangeColor}
                        onActiveColorTabChanged={onColorTabChange} />
                }
            </Col>
        </Row>
    );
};

export const CustomProperties = () => {
    const dispatch = useDispatch();
    const selectedDiagramId = useStore(getDiagramId);
    const selectedColorTab = useStore(s => s.ui.selectedColorTab);
    const selectedConfigurables = useStore(getSelectedConfigurables);
    const selectedShape = useStore(getSelectedShape);

    const doSelectColorTab = useEventCallback((key: string) => {
        dispatch(selectColorTab(key));
    });

    const doChange = useEventCallback((key: string, value: any) => {
        if (selectedDiagramId && selectedShape) {
            dispatch(changeItemsAppearance(selectedDiagramId, [selectedShape], key, value));
        }
    });

    if (!selectedShape || !selectedDiagramId) {
        return null;
    }

    return (
        <>
            {selectedDiagramId && selectedConfigurables && selectedConfigurables.map(c =>
                <CustomProperty key={c.name}
                    selectedColorTab={selectedColorTab}
                    configurable={c}
                    onChange={doChange}
                    onColorTabChange={doSelectColorTab}
                    value={selectedShape.appearance.get(c.name)}
                />,
            )}
        </>
    );
};
