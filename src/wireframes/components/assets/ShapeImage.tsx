/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ShapeInfo } from '@app/wireframes/model';
import { ShapeRenderer } from '@app/wireframes/shapes/ShapeRenderer';
import { AppTheme } from '@app/wireframes/interface';

interface ShapeImageProps {
    // The shape data.
    shape: ShapeInfo;

    appTheme: AppTheme;
}

const DESIRED_WIDTH = 120;
const DESIRED_HEIGHT = 72;

export const ShapeImage = React.memo((props: ShapeImageProps) => {
    const { appTheme, shape } = props;

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
        <div className='asset-shape-image'>
            <ShapeRenderer ref={drag}
                appTheme={appTheme}
                desiredHeight={DESIRED_HEIGHT} 
                desiredWidth={DESIRED_WIDTH} 
                plugin={shape.plugin}
                usePreviewOffset
                usePreviewSize 
            />
        </div>
    );
});