import { Col, InputNumber, Row, Select } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { ColorPicker } from '@app/core';

import {
    changeItemsAppearance,
    ColorConfigurable,
    Configurable,
    DiagramVisual,
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

import { CustomSlider } from './custom-slider';

interface CustomPropertiesProps {
    // The selected diagram.
    selectedDiagramId: string | null;

    // The selected items.
    selectedShape: DiagramVisual | null;

    // The configurable properties.
    selectedConfigurables: Configurable[];

    // The selected color tab.
    selectedColorTab: string;

    // Change the items appearance..
    changeItemsAppearance: (diagram: string, visuals: DiagramVisual[], key: string, val: any) => any;

    // Selectes the color tab.
    selectColorTab: (key: string) => any;
}

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

const CustomProperties = (props: CustomPropertiesProps) => {
    return (
        <>
            {props.selectedDiagramId && props.selectedConfigurables.map(c =>
                <Row key={c.name} className='property'>
                    <Col span={12} className='property-label'>
                        {c.label}
                    </Col>
                    <Col span={12} className='property-value'>
                        {c instanceof SliderConfigurable &&
                            <CustomSlider value={props.selectedShape!.appearance.get(c.name)}
                                min={c.min}
                                max={c.max}
                                onChange={value => props.changeItemsAppearance(props.selectedDiagramId!, [props.selectedShape!], c.name, value)} />
                        }
                        {c instanceof NumberConfigurable &&
                            <InputNumber value={props.selectedShape!.appearance.get(c.name)}
                                min={c.min}
                                max={c.max}
                                onChange={value => props.changeItemsAppearance(props.selectedDiagramId!, [props.selectedShape!], c.name, value)} />
                        }
                        {c instanceof SelectionConfigurable &&
                            <Select value={props.selectedShape!.appearance.get(c.name)}
                                onChange={value => props.changeItemsAppearance(props.selectedDiagramId!, [props.selectedShape!], c.name, value)}>
                                {c.options.map(o =>
                                    <Select.Option key={o} value={o}>{o}</Select.Option>
                                )}
                            </Select>
                        }
                        {c instanceof ColorConfigurable &&
                            <ColorPicker activeColorTab={props.selectedColorTab} value={props.selectedShape!.appearance.get(c.name)}
                                onChange={value => props.changeItemsAppearance(props.selectedDiagramId!, [props.selectedShape!], c.name, value.toNumber())}
                                onActiveColorTabChanged={key => props.selectColorTab(key)} />
                        }
                    </Col>
                </Row>
            )}
        </>
    );
};

export const CustomPropertiesContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(CustomProperties);