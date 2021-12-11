/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Color, ColorPicker } from '@app/core';
import { changeItemsAppearance, ColorConfigurable, Configurable, getDiagramId, getSelectedConfigurables, getSelectedShape, NumberConfigurable, selectColorTab, SelectionConfigurable, SliderConfigurable, useStore } from '@app/wireframes/model';
import { Col, InputNumber, Row, Select } from 'antd';
import * as React from 'react';
import { useDispatch } from 'react-redux';
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

    const doChangeValue = React.useCallback((newValue: any) => {
        onChange(configurable.name, newValue);
    }, [configurable, onChange]);

    const doChangeColor = React.useCallback((color: Color) => {
        onChange(configurable.name, color.toNumber());
    }, [configurable, onChange]);

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
                    <ColorPicker activeColorTab={selectedColorTab} value={value}
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

    const doSelectColorTab = React.useCallback((key: string) => {
        dispatch(selectColorTab(key));
    }, [dispatch]);

    const doChange = React.useCallback((key: string, value: any) => {
        dispatch(changeItemsAppearance(selectedDiagramId, [selectedShape], key, value));
    }, [dispatch, selectedDiagramId, selectedShape]);

    if (!selectedShape || !selectedDiagramId) {
        return null;
    }

    return (
        <>
            {selectedDiagramId && selectedConfigurables.map(c =>
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
