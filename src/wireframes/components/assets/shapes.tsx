import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Input } from 'antd';

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

const Shapes = (props: ShapesProps) => {
    return (
        <>
            <div className='asset-shapes-search'>
                <Input placeholder='Find shape' value={props.shapesFilter} onChange={event => props.filterShapes(event.target.value)} />
            </div>

            <div className='asset-shapes-list'>
                {props.shapesFiltered.map(s =>
                    <div key={s.label} className='asset-shape'>
                        <div className='asset-shape-image-row'>
                            <ShapeImage shape={s} />
                        </div>

                        <div className='asset-shape-title'>{s.label}</div>
                    </div>
                )}
            </div>
        </>
    );
};

export const ShapesContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Shapes);