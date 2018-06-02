import { Input } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import './shapes.scss';

import { Grid, MathHelper } from '@app/core';

import {
    addVisual,
    AssetsState,
    Diagram,
    EditorState,
    filterShapes,
    getSelection,
    ShapeInfo,
    UndoableState
} from '@app/wireframes/model';

import { ShapeImage } from './shape-image';

interface ShapesProps {
    // The filtered shapes.
    shapesFiltered: ShapeInfo[];

    // The shapes filter.
    shapesFilter: string;

    // The selected diagram.
    selectedDiagram: Diagram | null;

    // Filter the shapes.
    filterShapes: (value: string) => any;

    // Adds an visual.
    addVisualToPosition: (diagram: Diagram, renderer: string) => any;
}

const addVisualToPosition = (diagram: Diagram, renderer: string) => {
    return addVisual(diagram, renderer, 100, 100, MathHelper.guid());
};

const mapStateToProps = (state: { assets: AssetsState, editor: UndoableState<EditorState> }) => {
    const { diagram } = getSelection(state);

    return {
        selectedDiagram: diagram,
        shapesFiltered: state.assets.shapesFiltered,
        shapesFilter: state.assets.shapesFilter
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    filterShapes, addVisualToPosition
}, dispatch);

const Shapes = (props: ShapesProps) => {
    const cellRenderer = (shape: ShapeInfo) => {
        const doAdd = () => {
            if (props.selectedDiagram) {
                props.addVisualToPosition(props.selectedDiagram, shape.label);
            }
        };

        return (
            <div className='asset-shape'>
                <div className='asset-shape-image-row' onDoubleClick={doAdd}>
                    <ShapeImage shape={shape} />
                </div>

                <div className='asset-shape-title'>{shape.label}</div>
            </div>
        );
    };

    return (
        <>
            <div className='asset-shapes-search'>
                <Input placeholder='Find shape' value={props.shapesFilter} onChange={event => props.filterShapes(event.target.value)} />
            </div>

            <Grid className='asset-shapes-list' renderer={cellRenderer} columns={2} items={props.shapesFiltered} keyBuilder={shape => shape.name} />
        </>
    );
};

export const ShapesContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Shapes);