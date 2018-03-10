import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux';
import { Select } from 'antd';
import * as React from 'react';

import { ColorPicker } from '@app/core';

import {
    changeItemsAppearance,
    ColorConfigurable,
    Configurable,
    Diagram,
    DiagramShape,
    DiagramVisual,
    EditorState,
    getSelection,
    SelectionConfigurable,
    SliderConfigurable,
    UndoableState
} from '@app/wireframes/model';

import { CustomSlider } from './custom-slider';

interface CustomPropertiesProps {
    // The selected diagram.
    selectedDiagram: Diagram | null;

    // The selected items.
    selectedShape: DiagramVisual | null;

    // The configurable properties.
    configurables: Configurable[];

    // Change the items appearance..
    changeItemsAppearance: (diagram: Diagram, visuals: DiagramVisual[], key: string, val: any) => any;
}

const mapStateToProps = (state: { editor: UndoableState<EditorState> }) => {
    const { diagram, items } = getSelection(state);

    let selectedShape: DiagramShape | null = null;

    if (items.length === 1) {
        const single = items[0];

        if (single instanceof DiagramShape) {
            selectedShape = single;
        }
    }

    return {
        selectedDiagram: diagram,
        selectedShape,
        configurables: selectedShape ? selectedShape.configurables : []
    };
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    changeItemsAppearance
}, dispatch);

const CustomProperties = (props: CustomPropertiesProps) => {
    return (
        <>
            {props.configurables.map(c =>
                <div key={c.name}>
                    {c instanceof SliderConfigurable &&
                        <CustomSlider
                            value={props.selectedShape!.appearance.get(c.name)}
                            min={c.min}
                            max={c.max}
                            onChange={ev => props.changeItemsAppearance(props.selectedDiagram!, [props.selectedShape!], c.name, ev)} />
                    }
                    {c instanceof SelectionConfigurable &&
                        <Select
                            value={props.selectedShape!.appearance.get(c.name)}
                            allowClear={false}
                            autoFocus={false}
                            onChange={ev => props.changeItemsAppearance(props.selectedDiagram!, [props.selectedShape!], c.name, ev)}>
                            {c.options.map(o =>
                                <Select.Option key={o} value={o}>{o}</Select.Option>
                            )}
                        </Select>
                    }
                    {c instanceof ColorConfigurable &&
                        <ColorPicker
                            color={props.selectedShape!.appearance.get(c.name)}
                            onChange={ev => props.changeItemsAppearance(props.selectedDiagram!, [props.selectedShape!], c.name, ev)} />
                    }
                </div>
            )}
        </>
    );
}

export const CustomPropertiesContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(CustomProperties);