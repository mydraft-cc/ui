/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rect2, sizeInPx, SVGHelper, Vec2 } from '@app/core';
import { Diagram, DiagramContainer, DiagramItem, RendererService, Transform } from '@app/wireframes/model';
import * as React from 'react';
import * as svg from '@svgdotjs/svg.js';
import { CanvasView } from './CanvasView';
import { InteractionService } from './interaction-service';
import { SelectionAdorner } from './SelectionAdorner';
import { ShapeRef } from './shape-ref';
import { TextAdorner } from './TextAdorner';
import { TransformAdorner } from './TransformAdorner';

import './Editor.scss';

export interface EditorState {
    // The selected items.
    selectedItems: DiagramItem[];

    // The selected items including locked items.
    selectedItemsWithLocked: DiagramItem[];
}

export interface EditorProps {
    // The renderer service.
    rendererService: RendererService;

    // The selected diagram.
    diagram?: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];

    // The selected items including locked items.
    selectedItemsWithLocked: DiagramItem[];

    // The zoomed width of the canvas.
    zoomedSize: Vec2;

    // The optional viewbox.
    viewBox?: Rect2;

    // The view size.
    viewSize: Vec2;

    // The zoom value of the canvas.
    zoom: number;

    // True when rendered.
    onRender?: () => void;

    // A function to select a set of items.
    onSelectItems?: (diagram: Diagram, itemIds: string[]) => any;

    // A function to change the appearance of a visual.
    onChangeItemsAppearance?: (diagram: Diagram, visuals: DiagramItem[], key: string, val: any) => any;

    // A function to transform a set of items.
    onTransformItems?: (diagram: Diagram, items: DiagramItem[], oldBounds: Transform, newBounds: Transform) => any;
}

const showDebugOutlines = process.env.NODE_ENV === 'false';

export const Editor = React.memo((props: EditorProps) => {
    const {
        diagram,
        onChangeItemsAppearance,
        onSelectItems,
        onTransformItems,
        rendererService,
        viewBox,
        viewSize,
        zoom,
        zoomedSize,
    } = props;

    const w = viewSize.x;
    const h = viewSize.y;

    // Use a state here to force an update.
    const [interactionService, setInteractionService] = React.useState<InteractionService>();
    const adornersSelect = React.useRef<svg.Container>();
    const adornersTransform = React.useRef<svg.Container>();
    const diagramTools = React.useRef<svg.Element>();
    const diagramRendering = React.useRef<svg.Container>();
    const shapeRefsById = React.useRef<{ [id: string]: ShapeRef }>({});
    const [selectedItemsWithLocked, setSelectedItemsWithLocked] = React.useState<DiagramItem[]>([]);

    React.useEffect(() => {
        setSelectedItemsWithLocked(props.selectedItemsWithLocked);
    }, [props.selectedItemsWithLocked]);

    const initDiagramScope = React.useCallback((doc: svg.Svg) => {
        diagramTools.current = doc.rect().fill('transparent');
        diagramRendering.current = doc.group();
        adornersSelect.current = doc.group();
        adornersTransform.current = doc.group();

        setInteractionService(new InteractionService([adornersSelect.current, adornersTransform.current], diagramRendering.current, doc));
    }, []);

    React.useEffect(() => {
        if (interactionService) {
            SVGHelper.setSize(diagramTools.current, w, h);
            SVGHelper.setSize(adornersSelect.current, w, h);
            SVGHelper.setSize(adornersTransform.current, w, h);
            SVGHelper.setSize(diagramRendering.current, w, h);
        }
    }, [w, h, interactionService]);

    const orderedShapes = React.useMemo(() => {
        const flattenShapes: DiagramItem[] = [];

        if (diagram) {
            let handleContainer: (itemIds: DiagramContainer) => any;

            // eslint-disable-next-line prefer-const
            handleContainer = itemIds => {
                for (const id of itemIds.values) {
                    const item = diagram.items.get(id);

                    if (item) {
                        if (item.type === 'Shape') {
                            flattenShapes.push(item);
                        }

                        if (item.type === 'Group') {
                            handleContainer(item.childIds);
                        }
                    }
                }
            };

            handleContainer(diagram.root);
        }

        return flattenShapes;
    }, [diagram]);

    const forceRender = React.useCallback(() => {
        if (!interactionService) {
            return;
        }

        const allShapesById: { [id: string]: boolean } = {};
        const allShapes = orderedShapes;

        allShapes.forEach(item => {
            allShapesById[item.id] = true;
        });

        const references = shapeRefsById.current;

        // Delete old shapes.
        for (const [id, ref] of Object.entries(references)) {
            if (!allShapesById[id]) {
                ref.remove();

                delete references[id];
            }
        }

        // Create missing shapes.
        for (const shape of allShapes) {
            if (!references[shape.id]) {
                const renderer = rendererService.registeredRenderers[shape.renderer];

                references[shape.id] = new ShapeRef(diagramRendering.current, renderer, showDebugOutlines);
            }
        }

        let hasIdChanged = false;

        allShapes.forEach((shape, i) => {
            if (!references[shape.id].checkIndex(i)) {
                hasIdChanged = true;
            }
        });

        // If the index of at least once shape has changed we have to remove them all to render them in the correct order.
        if (hasIdChanged) {
            for (const ref of Object.values(references)) {
                ref.remove();
            }
        }

        for (const shape of allShapes) {
            references[shape.id].render(shape);
        }

        if (props.onRender) {
            props.onRender();
        }
    }, [interactionService, orderedShapes, props, rendererService.registeredRenderers]);

    React.useEffect(() => {
        forceRender();
    });

    const style: React.CSSProperties = { position: 'relative', width: sizeInPx(zoomedSize.x), height: sizeInPx(zoomedSize.y) };

    return (
        <>
            {diagram &&
                <div className='editor' style={style}>
                    <CanvasView onInit={initDiagramScope}
                        viewBox={viewBox}
                        viewSize={viewSize}
                        zoom={zoom}
                        zoomedSize={zoomedSize} />

                    {interactionService && diagram && (
                        <>
                            {onTransformItems &&
                                <TransformAdorner
                                    adorners={adornersTransform.current}
                                    interactionService={interactionService}
                                    onTransformItems={onTransformItems}
                                    selectedDiagram={diagram}
                                    selectedItems={props.selectedItems}
                                    viewSize={viewSize}
                                    zoom={zoom} />
                            }

                            {onSelectItems &&
                                <SelectionAdorner
                                    adorners={adornersSelect.current}
                                    interactionService={interactionService}
                                    onSelectItems={onSelectItems}
                                    selectedDiagram={diagram}
                                    selectedItems={selectedItemsWithLocked} />
                            }

                            {onChangeItemsAppearance &&
                                <TextAdorner
                                    interactionService={interactionService}
                                    onChangeItemsAppearance={onChangeItemsAppearance}
                                    selectedDiagram={diagram}
                                    selectedItems={props.selectedItems}
                                    zoom={zoom} />
                            }
                        </>
                    )}
                </div>
            }
        </>
    );
});
