/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { SearchOutlined } from '@ant-design/icons';
import { Grid } from '@app/core';
import { texts } from '@app/texts';
import { addVisual, filterShapes, getDiagramId, getFilteredShapes, getShapesFilter, ShapeInfo, useStore } from '@app/wireframes/model';
import { Input } from 'antd';
import * as React from 'react';
import { ReactReduxContext, useDispatch } from 'react-redux';
import { ShapeImage } from './ShapeImage';
import './Shapes.scss';

const keyBuilder = (shape: ShapeInfo) => {
    return shape.name;
};

export const Shapes = () => {
    const dispatch = useDispatch();
    const shapesFiltered = useStore(getFilteredShapes);
    const shapesFilter = useStore(getShapesFilter);

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
    }, [dispatch, storeContext.store]);

    const doFilterShapes = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(filterShapes({ filter: event.target.value }));
    }, [dispatch]);

    return (
        <>
            <div className='asset-shapes-search'>
                <Input value={shapesFilter} onChange={doFilterShapes}
                    placeholder={texts.common.findShape}
                    prefix={
                        <SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />
                    } />
            </div>

            <Grid className='asset-shapes-list' renderer={cellRenderer} columns={2} items={shapesFiltered} keyBuilder={keyBuilder} />
        </>
    );
};
