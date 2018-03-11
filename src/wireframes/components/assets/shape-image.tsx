import * as React from 'react';
import { DragSource, DragSourceSpec, DragSourceCollector } from 'react-dnd';

import { ShapeInfo } from '@app/wireframes/model';

interface ShapeProps {
    // The shape data.
    shape: ShapeInfo;

    // Indicates if the shape is being dragged.
    isDragging?: false;

    // The drag source.
    connectDragSource?: any;
}

const ShapeTarget: DragSourceSpec<ShapeProps> = {
    beginDrag: props => {
        return { type: props.shape.name };
    }
};

const ShapeConnect: DragSourceCollector = (connect, monitor) => {
    return { connectDragSource: connect.dragSource(), isDragging: monitor.isDragging() };
};

@DragSource('SHAPE', ShapeTarget, ShapeConnect)
export class ShapeImage extends React.Component<ShapeProps> {
    public render() {
        return this.props.connectDragSource!(
            <img style={{opacity: this.props.isDragging ? 0.8 : 1 }} className='shape-image' alt={this.props.shape.name} src={urlPath(this.props.shape)} />
        );
    }
}

const pathToShapes = require.context('../../../images/shapes', true);

const urlPath = (shape: ShapeInfo) => {
    return pathToShapes(`./${shape.nameLower}.png`);
};