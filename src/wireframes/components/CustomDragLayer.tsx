/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { useDragLayer, XYCoord } from 'react-dnd';
import { ShapePlugin } from '@app/wireframes/interface';
import { getViewBox, ShapeRenderer } from './../shapes/ShapeRenderer';
import './CustomDragLayer.scss';

export const CustomDragLayer = () => {
    const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
        currentOffset: monitor.getSourceClientOffset(),
        isDragging: monitor.isDragging(),
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
        initialOffset: monitor.getInitialSourceClientOffset(),
    }));

    function renderItem() {
        switch (itemType) {
            case 'DND_ASSET':
                const plugin = item['plugin'] as ShapePlugin;

                return (
                    <div style={getItemStyles(initialOffset, currentOffset, plugin)}>
                        <ShapeRenderer plugin={plugin} />
                    </div>
                );
            default:
                return null;
        }
    }
    
    if (!isDragging) {
        return null;
    }

    return (
        <div className='drag-layer'>
            {renderItem()}
        </div>
    );
};

function getItemStyles(initialOffset: XYCoord | null, currentOffset: XYCoord | null, plugin: ShapePlugin) {
    if (!initialOffset || !currentOffset) {
        return { display: 'none' };
    }
  
    const transform = `translate(${currentOffset.x}px, ${currentOffset.y}px)`;

    const { size } = getViewBox(plugin);

    return { transform, WebkitTransform: transform, width: size.x, height: size.y };
}