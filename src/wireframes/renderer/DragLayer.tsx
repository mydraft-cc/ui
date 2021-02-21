/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper, Svg, Vec2 } from '@app/core';
import * as React from 'react';
import { useDragLayer, XYCoord } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import svg = require('svg.js');
import { Diagram, DiagramItem, RendererService, SnapManager, Transform } from '../model';
import { InteractionOverlays } from './interaction-overlays';

const layerStyles: React.CSSProperties = {
    left: 0,
    pointerEvents: 'none',
    position: 'fixed',
    top: 0,
    zIndex: 100,
};

type Target = { transform: Transform, element: HTMLDivElement };

export interface PreviewProps {
    rendererService: RendererService;

    shape: string;

    editorRef: React.RefObject<HTMLDivElement>;

    initialOffset: XYCoord;

    onInit: (target: Target) => void;
}

export const Preview = React.memo((props: PreviewProps) => {
    const {
        editorRef,
        onInit,
        rendererService,
        shape,
        initialOffset,
    } = props;

    const [doc, setDoc] = React.useState<svg.Doc>();
    const [element, setElement] = React.useState<HTMLDivElement>();

    React.useEffect(() => {
        console.log('RENDER');
    });

    React.useEffect(() => {
        if (doc && shape && rendererService && element) {
            const renderer = rendererService.registeredRenderers[shape];

            if (renderer) {
                doc.clear();

                const shape = renderer.createDefaultShape(MathHelper.guid());

                renderer.setContext(doc);
                renderer.render(shape);

                doc.size(shape.transform.size.x, shape.transform.size.y).viewbox(shape.transform.aabb);

                const componentRect = (findDOMNode(editorRef.current) as HTMLDivElement)!.getBoundingClientRect();

                const x = Math.round(0.5 * shape.transform.size.x + (initialOffset.x - componentRect.left));
                const y = Math.round(0.5 * shape.transform.size.y + (initialOffset.y - componentRect.top));

                onInit({ transform: shape.transform.moveTo(new Vec2(x, y)), element });
            }
        }
    }, [doc, shape, onInit, rendererService, element]);

    return (
        <div style={layerStyles}>
            <div ref={setElement}>
                <Svg onInit={setDoc} />
            </div>
        </div>
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

    // The view size.
    viewSize: Vec2;

    editorRef: React.RefObject<HTMLDivElement>;
}

export const DragLayer = (props: DragLayerProps) => {
    const { rendererService, selectedDiagram, viewSize, interactionOverlays, snapManager, editorRef } = props;

    const [target, setTarget] = React.useState<Target>();

    const {
        diff,
        initialOffset,
        isDragging,
        item,
        itemType,
    } = useDragLayer((monitor) => ({
        diff: monitor.getDifferenceFromInitialOffset(),
        initialOffset: monitor.getInitialSourceClientOffset(),
        isDragging: monitor.isDragging(),
        item: monitor.getItem(),
        itemType: monitor.getItemType(),
    }));

    React.useEffect(() => {
        interactionOverlays?.reset();
    }, [isDragging]);

    React.useEffect(() => {
        if (!target) {
            return;
        }

        if (!initialOffset || !item || !diff) {
            target.element.style.display = 'none';
            return;
        }

        interactionOverlays.reset();

        const delta = new Vec2(diff.x, diff.y);

        const snapResult = snapManager.snapMoving(selectedDiagram, viewSize, target.transform, delta, false);

        const x = initialOffset.x + snapResult.delta.x;
        const y = initialOffset.y + snapResult.delta.y;

        interactionOverlays.showSnapAdorners(snapResult);

        item.localX = target.transform.position.x + snapResult.delta.x;
        item.localY = target.transform.position.y + snapResult.delta.y;

        const transform = `translate(${x}px, ${y}px)`;

        target.element.style.transform = transform;
        target.element.style.webkitTransform = transform;
    }, [target, diff, initialOffset, isDragging, item]);

    if (!isDragging) {
        return null;
    }

    switch (itemType) {
        case 'DND_ASSET':
            return <Preview editorRef={editorRef} shape={item.shape} rendererService={rendererService} initialOffset={initialOffset} onInit={setTarget} />;
        default:
            return null;
    }
};
