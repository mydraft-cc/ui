import { Col, InputNumber, Row, Select } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { ColorPicker } from '@app/core';

import {
    changeItemsAppearance,
    ColorConfigurable,
    Configurable,
    DiagramItem,
    EditorStateInStore,
    getDiagramId,
    getSelectedConfigurables,
    getSelectedShape,
    NumberConfigurable,
    selectColorTab,
    SelectionConfigurable,
    SliderConfigurable,
    UIStateInStore
} from '@app/wireframes/model';

import { CustomSlider } from './CustomSlider';

interface CustomPropertiesProps {
    // The selected diagram.
    selectedDiagramId: string | null;

    // The selected items.
    selectedShape: DiagramItem | null;

    // The configurable properties.
    selectedConfigurables: Configurable[];

    // The selected color tab.
    selectedColorTab: string;

    // Change the items appearance..
    changeItemsAppearance: (diagram: string, visuals: DiagramItem[], key: string, val: any) => any;

    // Selectes the color tab.
    selectColorTab: (key: string) => any;
}

const CustomProperties = (props: CustomPropertiesProps) => {
    const { selectedColorTab, selectedConfigurables, selectedDiagramId, selectedShape } = props;

    return selectedShape && selectedDiagramId ? (
        <>
            {selectedDiagramId && selectedConfigurables.map(c =>
                <Row key={c.name} className='property'>
                    <Col span={12} className='property-label'>
                        {c.label}
                    </Col>
                    <Col span={12} className='property-value'>
                        {c instanceof SliderConfigurable &&
                            <CustomSlider value={selectedShape.appearance.get(c.name)}
                                min={c.min}
                                max={c.max}
                                onChange={value => props.changeItemsAppearance(selectedDiagramId, [selectedShape], c.name, value)} />
                        }
                        {c instanceof NumberConfigurable &&
                            <InputNumber value={selectedShape.appearance.get(c.name)}
                                min={c.min}
                                max={c.max}
                                onChange={value => props.changeItemsAppearance(selectedDiagramId, [selectedShape], c.name, value)} />
                        }
                        {c instanceof SelectionConfigurable &&
                            <Select value={selectedShape.appearance.get(c.name)}
                                onChange={(value: any) => props.changeItemsAppearance(selectedDiagramId, [selectedShape], c.name, value)}>
                                {c.options.map(o =>
                                    <Select.Option key={o} value={o}>{o}</Select.Option>
                                )}
                            </Select>
                        }
                        {c instanceof ColorConfigurable &&
                            <ColorPicker activeColorTab={selectedColorTab} value={selectedShape.appearance.get(c.name)}
                                onChange={value => props.changeItemsAppearance(selectedDiagramId, [selectedShape], c.name, value.toNumber())}
                                onActiveColorTabChanged={key => props.selectColorTab(key)} />
                        }
                    </Col>
                </Row>
            )}
        </>
    ) : null;
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