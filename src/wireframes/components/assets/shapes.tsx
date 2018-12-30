import { Icon, Input } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import './shapes.scss';

import { Grid } from '@app/core';

import {
    addVisual,
    AssetsState,
    EditorState,
    filterShapes,
    getFilteredShapes,
    getShapesFilter,
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
    selectedDiagramId: string | null;

    // Filter the shapes.
    filterShapes: (value: string) => any;

    // Adds an visual.
    addVisualToPosition: (diagram: string, renderer: string) => any;
}

const addVisualToPosition = (diagram: string, renderer: string) => {
    return addVisual(diagram, renderer, 100, 100);
};

const mapStateToProps = (state: { assets: AssetsState, editor: UndoableState<EditorState> }) => {
    return {
        selectedDiagramId: state.editor.present.selectedDiagramId,
        shapesFiltered: getFilteredShapes(state),
        shapesFilter: getShapesFilter(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    filterShapes, addVisualToPosition
}, dispatch);

class Shapes extends React.PureComponent<ShapesProps> {
    private cellRenderer = (shape: ShapeInfo) => {
        const doAdd = () => {
            const diagramId = this.props.selectedDiagramId;

            if (diagramId) {
                this.props.addVisualToPosition(diagramId, shape.name);
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
    }

    private doFilterShapes = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.filterShapes(event.target.value);
    }

    private keyBuilder = (shape: ShapeInfo) => {
        return shape.name;
    }

    public render() {
        return (
            <>
                <div className='asset-shapes-search'>
                    <Input value={this.props.shapesFilter} onChange={this.doFilterShapes}
                        placeholder='Find shape'
                        prefix={<Icon type='search' style={{ color: 'rgba(0,0,0,.25)' }} />} />
                </div>

                <Grid className='asset-shapes-list' renderer={this.cellRenderer} columns={2} items={this.props.shapesFiltered} keyBuilder={this.keyBuilder} />
            </>
        );
    }
}

export const ShapesContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Shapes);