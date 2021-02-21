/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper, Svg } from '@app/core';
import * as React from 'react';
import { useDragLayer, XYCoord } from 'react-dnd';
import svg = require('svg.js');
import { Diagram, DiagramItem, RendererService, SnapManager } from '../model';
import { InteractionOverlays } from './interaction-overlays';

const layerStyles: React.CSSProperties = {
    left: 0,
    pointerEvents: 'none',
    position: 'fixed',
    top: 0,
    zIndex: 100,
};

function getItemStyles(
    initialOffset: XYCoord | null,
    currentOffset: XYCoord | null,
) {
    if (!initialOffset || !currentOffset) {
        return {
            display: 'none',
        };
    }

    const { x, y } = currentOffset;

    const transform = `translate(${x}px, ${y}px)`;

    return { transform, WebkitTransform: transform };
}

export interface PreviewProps {
    rendererService: RendererService;

    name: string;
}

export const Preview = React.memo((props: PreviewProps) => {
    const { name, rendererService } = props;

    const [doc, setDoc] = React.useState<svg.Doc>();

    React.useEffect(() => {
        if (doc && name && rendererService) {
            const renderer = rendererService.registeredRenderers[name];

            if (renderer) {
                doc.clear();

                const shape = renderer.createDefaultShape(MathHelper.guid());

                renderer.setContext(doc);
                renderer.render(shape);

                doc.size(shape.transform.size.x, shape.transform.size.y).viewbox(shape.transform.aabb);

                console.log('render');
            }
        }
    }, [doc, name, rendererService]);

    return (
        <Svg onInit={setDoc} />
    );
});

export interface DragLayerProps {
    rendererService: RendererService;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];

    // The interaction overlays.
    interactionOverlays: InteractionOverlays;

    // The snap manager.
    snapManager: SnapManager;
}

export const DragLayer = (props: DragLayerProps) => {
    const { rendererService } = props;

    const {
        currentOffset,
        initialOffset,
        isDragging,
        item,
        itemType,
    } = useDragLayer((monitor) => ({
        currentOffset: monitor.getSourceClientOffset(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        isDragging: monitor.isDragging(),
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
    }));

    function renderItem() {
        switch (itemType) {
            case 'DND_ASSET':
                return <Preview name={item.shape} rendererService={rendererService} />;
            default:
                return null;
        }
    }

    if (!isDragging) {
        return null;
    }

    return (
        <div style={layerStyles}>
            <div style={getItemStyles(initialOffset, currentOffset)}>
                {renderItem()}
            </div>
        </div>
    );
};
