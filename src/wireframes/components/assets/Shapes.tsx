import { Icon, Input } from 'antd';
import * as React from 'react';
import { ReactReduxContext, useDispatch } from 'react-redux';

import './Shapes.scss';

import { Grid } from '@app/core';

import {
    addVisual,
    filterShapes,
    getDiagramId,
    getFilteredShapes,
    getShapesFilter,
    ShapeInfo,
    useStore
} from '@app/wireframes/model';

import { ShapeImage } from './ShapeImage';

const keyBuilder = (shape: ShapeInfo) => {
    return shape.name;
};

export const Shapes = () => {
    const dispatch = useDispatch();
    const shapesFiltered = useStore(s => getFilteredShapes(s));
    const shapesFilter = useStore(s => getShapesFilter(s));

    const storeContext = React.useContext(ReactReduxContext);

    const cellRenderer = React.useCallback((shape: ShapeInfo) => {
        const doAdd = () => {
            const selectedDiagramId = getDiagramId(storeContext.store.getState());

            if (selectedDiagramId) {
                dispatch(addVisual(selectedDiagramId, shape.name, 100, 100));
            }
        };

        return (
            <div className='asset-shape'>
                <div className='asset-shape-image-row' onDoubleClick={doAdd}>
                    <ShapeImage shape={shape} />
                </div>

                <div className='asset-shape-title'>{shape.displayName}</div>
            </div>
        );
    }, []);

    const doFilterShapes = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(filterShapes(event.target.value));
    }, []);

    return (
        <>
            <div className='asset-shapes-search'>
                <Input value={shapesFilter} onChange={doFilterShapes}
                    placeholder='Find shape'
                    prefix={<Icon type='search' style={{ color: 'rgba(0,0,0,.25)' }} />} />
            </div>

            <Grid className='asset-shapes-list' renderer={cellRenderer} columns={2} items={shapesFiltered} keyBuilder={keyBuilder} />
        </>
    );
};