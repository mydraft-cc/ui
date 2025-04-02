/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import * as React from 'react';
import { useStore as useReduxStore } from 'react-redux';
import { Grid, useEventCallback } from '@app/core';
import { AppState, useAppDispatch, useAppSelector } from '@app/store';
import { texts } from '@app/texts';
import { addShape, filterShapes, getDiagramId, getFilteredShapes, getShapesFilter, ShapeInfo, useStore } from '@app/wireframes/model';
import { selectEffectiveAppTheme } from '@app/wireframes/model/selectors/themeSelectors';
import { AppTheme } from '@app/wireframes/interface';
import { ShapeImage } from './ShapeImage';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import './Shapes.scss';

const keyBuilder = (shape: ShapeInfo) => {
    return shape.name;
};

interface ShapeItemProps {
    shape: ShapeInfo;
    appTheme: AppTheme;
    onAdd: (shape: ShapeInfo) => void;
}

const ShapeItem: React.FC<ShapeItemProps> = ({ shape, appTheme, onAdd }) => {
    const [, drag, connectDragPreview] = useDrag({
        item: shape,
        previewOptions: {
            anchorX: 0,
            anchorY: 0,
        },
        type: 'DND_ASSET',
    });

    React.useEffect(() => {    
        connectDragPreview(getEmptyImage(), {
            anchorX: 0,
            anchorY: 0,
            captureDraggingState: true,
        });
    }, [connectDragPreview]);

    return (
        <div className='asset-shape' ref={drag} onDoubleClick={() => onAdd(shape)}>
            <div className='asset-shape-image-row'>
                <ShapeImage shape={shape} appTheme={appTheme} />
            </div>
            <div className='asset-shape-title'>{shape.displayName}</div>
        </div>
    );
};

export const Shapes = () => {
    const dispatch = useAppDispatch();
    const shapesFiltered = useStore(getFilteredShapes);
    const shapesFilter = useStore(getShapesFilter);
    const store = useReduxStore<AppState>();
    const appTheme = useAppSelector(selectEffectiveAppTheme);

    const doAdd = React.useCallback((shape: ShapeInfo) => {
        const selectedDiagramId = getDiagramId(store.getState());

        if (selectedDiagramId) {
            dispatch(addShape(selectedDiagramId, shape.name, { position: { x: 100, y: 100 } }));
        }
    }, [dispatch, store]);

    const cellRenderer = React.useCallback((shape: ShapeInfo) => {
        return (
            <ShapeItem 
                shape={shape} 
                appTheme={appTheme} 
                onAdd={doAdd}
            />
        );
    }, [doAdd, appTheme]);

    const doFilterShapes = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(filterShapes(event.target.value));
    });

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
