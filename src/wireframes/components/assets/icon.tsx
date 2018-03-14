import * as React from 'react';
import { DragSource, DragSourceSpec, DragSourceCollector } from 'react-dnd';

import { IconInfo } from '@app/wireframes/model';

interface IconProps {
    // The icon data.
    icon: IconInfo;

    // The drag source.
    connectDragSource?: any;
}

const IconTarget: DragSourceSpec<IconProps> = {
    beginDrag: props => {
        return { icon: props.icon.text };
    }
};

const IconConnect: DragSourceCollector = (connector, monitor) => {
    return { connectDragSource: connector.dragSource() };
};

@DragSource('DND_ASSET', IconTarget, IconConnect)
export class Icon extends React.PureComponent<IconProps> {
    public render() {
        return this.props.connectDragSource!(
            <i className={`fa fa-${this.props.icon.name}`} />,
        {
            dropEffect: 'copy'
        });
    }
}