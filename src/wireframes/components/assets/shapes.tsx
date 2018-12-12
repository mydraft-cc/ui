import { Input } from 'antd';
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
        shapesFiltered: state.assets.shapesFiltered,
        shapesFilter: state.assets.shapesFilter
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
                this.props.addVisualToPosition(diagramId, shape.key);
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

    public render() {
        return (
            <>
                <div className='asset-shapes-search'>
                    <Input placeholder='Find shape' value={this.props.shapesFilter} onChange={event => this.props.filterShapes(event.target.value)} />
                </div>

                <Grid className='asset-shapes-list' renderer={this.cellRenderer} columns={2} items={this.props.shapesFiltered} keyBuilder={shape => shape.searchTerm} />
            </>
        );
    }
}

export const ShapesContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Shapes);