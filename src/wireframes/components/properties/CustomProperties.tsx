import { Col, InputNumber, Row, Select } from 'antd';
import * as React from 'react';
import { connect, useDispatch } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Color, ColorPicker } from '@app/core';

import {
    changeItemsAppearance,
    ColorConfigurable,
    Configurable,
    EditorStateInStore,
    getDiagramId,
    getSelectedConfigurables,
    getSelectedShape,
    NumberConfigurable,
    selectColorTab,
    SelectionConfigurable,
    SliderConfigurable,
    UIStateInStore,
    useStore
} from '@app/wireframes/model';

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
        value
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
                            <Select.Option key={o} value={o}>{o}</Select.Option>
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

const CustomProperties = () => {
    const dispatch = useDispatch();
    const selectedDiagramId = useStore(s => getDiagramId(s));
    const selectedColorTab = useStore(s => s.ui.selectedColorTab);
    const selectedConfigurables = useStore(s => getSelectedConfigurables(s));
    const selectedShape = useStore(s => getSelectedShape(s));

    const doSelectColorTab = React.useCallback((key: string) => {
        dispatch(selectColorTab(key));
    }, []);

    const doChange = React.useCallback((key: string, value: any) => {
        dispatch(changeItemsAppearance(selectedDiagramId, [selectedShape], key, value));
    }, [selectedDiagramId, selectedShape]);

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
                />
            )}
        </>
    );
};

const mapStateToProps = (state: EditorStateInStore & UIStateInStore) => {
    return {
        selectedDiagramId: getDiagramId(state),
        selectedShape: getSelectedShape(state),
        selectedConfigurables: getSelectedConfigurables(state),
        selectedColorTab: state.ui.selectedColorTab
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    changeItemsAppearance, selectColorTab
}, dispatch);

export const CustomPropertiesContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(CustomProperties);