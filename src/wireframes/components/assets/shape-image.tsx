import * as React from 'react';
import { DragSource, DragSourceSpec, DragSourceCollector } from 'react-dnd';

import { ShapeInfo } from '@app/wireframes/model';

interface ShapeProps {
    // The shape data.
    shape: ShapeInfo;

    // The drag source.
    connectDragSource?: any;

    // The drag preview.
    connectDragPreview?: any;
}

const ShapeTarget: DragSourceSpec<ShapeProps> = {
    beginDrag: props => {
        return { type: props.shape.name };
    }
};

const ShapeConnect: DragSourceCollector = (connector, monitor) => {
    return { connectDragSource: connector.dragSource(), connectDragPreview: connector.dragPreview() };
};

@DragSource('DND_SHAPE', ShapeTarget, ShapeConnect)
export class ShapeImage extends React.Component<ShapeProps> {
    public render() {
        const preview = (node: any) => {
            if (node) {
                this.props.connectDragPreview(node.cloneNode(), {
                    dropEffect: 'copy',
                    anchorX: 0,
                    anchorY: 0
                });
            }
        };

        return this.props.connectDragSource!(
            <img ref={img => preview(img)} className='shape-image' alt={this.props.shape.name} src={urlPath(this.props.shape)} />,
        {
            dropEffect: 'copy'
        });
    }
}

const pathToShapes = require.context('../../../images/shapes', true);

const urlPath = (shape: ShapeInfo) => {
    return pathToShapes(`./${shape.nameLower}.png`);
};