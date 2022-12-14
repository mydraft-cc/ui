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
import { getViewBox, ShapeRenderer } from '@app/wireframes/shapes/ShapeRenderer';

interface ShapeImageProps {
    // The shape data.
    shape: ShapeInfo;
}

const DESIRED_WIDTH = 120;
const DESIRED_HEIGHT = 72;
const PREVIEW_RATIO = DESIRED_WIDTH / DESIRED_HEIGHT;

export const ShapeImage = React.memo((props: ShapeImageProps) => {
    const { shape } = props;

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

    const { outerSize } = getViewBox(shape.plugin, DESIRED_WIDTH, DESIRED_HEIGHT, true, true);

    let aspectRatio = outerSize.x / outerSize.y;

    let w = 0;
    let h = 0;

    if (aspectRatio > PREVIEW_RATIO) {
        w = DESIRED_WIDTH;
    } else {
        h = DESIRED_HEIGHT;
    }

    return (
        <div className='asset-shape-image'>
            <div ref={drag}>
                <ShapeRenderer 
                    desiredHeight={DESIRED_HEIGHT} 
                    desiredWidth={DESIRED_WIDTH} 
                    plugin={shape.plugin}
                    renderHeight={h} 
                    renderWidth={w}
                    usePreviewOffset
                    usePreviewSize 
                />
            </div>
        </div>
    );
});