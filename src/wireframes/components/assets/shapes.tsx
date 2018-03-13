import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Input } from 'antd';
import { AutoSizer, CellMeasurerCache, createMasonryCellPositioner, Masonry, MasonryCellProps } from 'react-virtualized';

import './shapes.scss';

import {
    AssetsState,
    filterShapes,
    ShapeInfo
} from '@app/wireframes/model';

import { ShapeImage } from './shape-image';

interface ShapesProps {
    // The filtered shapes.
    shapesFiltered: ShapeInfo[];

    // The shapes filter.
    shapesFilter: string;

    // Filter the shapes.
    filterShapes: (value: string) => any;
}

const mapStateToProps = (state: { assets: AssetsState }) => {
    return {
        shapesFiltered: state.assets.shapesFiltered,
        shapesFilter: state.assets.shapesFilter
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    filterShapes
}, dispatch);

const cache = new CellMeasurerCache({
    defaultHeight: 150,
    defaultWidth: 158,
    fixedWidth: true,
    fixedHeight: true
});

const cellPositioner = createMasonryCellPositioner({
    cellMeasurerCache: cache,
    columnCount: 2,
    columnWidth: 160,
    spacer: 0
});

const Shapes = (props: ShapesProps) => {
    const cellRenderer = (renderProps: MasonryCellProps) => {
        const shape = props.shapesFiltered[renderProps.index];

        if (!shape) {
            return null;
        }

        return (
            <div className='asset-shape'>
                <div className='asset-shape-image-row'>
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

            <div className='asset-shapes-list'>
                <AutoSizer className='asset-icons-list'>
                    {({ height, width }) => (
                        <Masonry
                            autoHeight={false}
                            cellCount={props.shapesFiltered.length}
                            cellMeasurerCache={cache}
                            cellPositioner={cellPositioner}
                            cellRenderer={cellRenderer}
                            height={height} width={width} />
                    )}
                </AutoSizer>
            </div>
        </>
    );
};

export const ShapesContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Shapes);