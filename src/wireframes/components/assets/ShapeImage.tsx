import * as React from 'react';
import { DragPreviewImage, useDrag } from 'react-dnd';

import { ShapeInfo } from '@app/wireframes/model';

interface ShapeImageProps {
    // The shape data.
    shape: ShapeInfo;
}

export const ShapeImage = React.memo((props: ShapeImageProps) => {
    const { shape } = props;

    const [, drag, connectDragPreview] = useDrag({
        item: { shape: shape.name, offset: shape.offset, type: 'DND_ASSET' }
    });

    return (
        <>
            <DragPreviewImage src={dragPath(shape)} connect={connectDragPreview} />

            <img ref={drag} className='asset-shape-image' alt={props.shape.displayName} src={previewPath(props.shape)} />
        </>
    );
});

const pathToShapes = require.context('../../../images/shapes', true);

const previewPath = (shape: ShapeInfo) => {
    try {
        return pathToShapes(`./${shape.displaySearch}-preview.png`);
    } catch {
        return pathToShapes(`./${shape.displaySearch}.png`);
    }
};

const dragPath = (shape: ShapeInfo) => {
    return pathToShapes(`./${shape.displaySearch}.png`);
};