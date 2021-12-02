/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Rect2, sizeInPx, Vec2 } from '@app/core';
import { Diagram, DiagramContainer, DiagramItem, RendererService, Transform } from '@app/wireframes/model';
import * as React from 'react';
import * as svg from 'svg.js';
import { CanvasView } from './CanvasView';
import { InteractionService } from './interaction-service';
import { SelectionAdorner } from './SelectionAdorner';
import { ShapeRef } from './shape-ref';
import { TextAdorner } from './TextAdorner';
import { TransformAdorner } from './TransformAdorner';

import './Editor.scss';

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

export class Editor extends React.Component<EditorProps> {
    private adornersSelect: svg.Container;
    private adornersTransform: svg.Container;
    private diagramTools: svg.Element;
    private diagramRendering: svg.Container;
    private interactionService: InteractionService;
    private shapeRefsById: { [id: string]: ShapeRef } = {};

    public componentDidUpdate() {
        this.forceRender();
    }

    private initDiagramScope = (doc: svg.Doc) => {
        this.diagramTools = doc.rect().fill('transparent');
        this.diagramRendering = doc.group();
        this.adornersSelect = doc.group();
        this.adornersTransform = doc.group();

        this.interactionService = new InteractionService([this.adornersSelect, this.adornersTransform], this.diagramRendering, doc);

        this.forceRender();
        this.forceUpdate();
    };

    private forceRender() {
        if (!this.interactionService) {
            return;
        }

        const allShapesById: { [id: string]: boolean } = {};
        const allShapes = this.getOrderedShapes();

        allShapes.forEach(item => {
            allShapesById[item.id] = true;
        });

        for (const [id, ref] of Object.entries(this.shapeRefsById)) {
            if (!allShapesById[id]) {
                ref.remove();

                delete this.shapeRefsById[id];
            }
        }

        for (const shape of allShapes) {
            let ref = this.shapeRefsById[shape.id];

            if (!ref) {
                const renderer = this.props.rendererService.registeredRenderers[shape.renderer];

                ref = new ShapeRef(this.diagramRendering, renderer, showDebugOutlines);
            }

            ref.render(shape);

            this.shapeRefsById[shape.id] = ref;
        }

        if (this.props.onRender) {
            this.props.onRender();
        }
    }

    private getOrderedShapes() {
        const flattenShapes: DiagramItem[] = [];

        const diagram = this.props.diagram;

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
    }

    public render() {
        // tslint:disable:no-shadowed-variable
        const {
            diagram,
            onChangeItemsAppearance,
            onSelectItems,
            onTransformItems,
            selectedItems,
            selectedItemsWithLocked,
            viewBox,
            viewSize,
            zoom,
            zoomedSize,
        } = this.props;

        const w = viewSize.x;
        const h = viewSize.y;

        if (this.interactionService) {
            this.diagramTools.size(w, h);
            this.adornersSelect.size(w, h);
            this.adornersTransform.size(w, h);
            this.diagramRendering.size(w, h);
        }

        const style: React.CSSProperties = { position: 'relative', width: sizeInPx(zoomedSize.x), height: sizeInPx(zoomedSize.y) };

        return (
            <>
                {diagram &&
                    <div className='editor' style={style}>
                        <CanvasView onInit={this.initDiagramScope}
                            viewBox={viewBox}
                            viewSize={viewSize}
                            zoom={zoom}
                            zoomedSize={zoomedSize} />

                        {this.interactionService && diagram && (
                            <>
                                {onTransformItems &&
                                    <TransformAdorner
                                        adorners={this.adornersTransform}
                                        interactionService={this.interactionService}
                                        onTransformItems={onTransformItems}
                                        selectedDiagram={diagram}
                                        selectedItems={selectedItems}
                                        viewSize={viewSize}
                                        zoom={zoom} />
                                }

                                {onSelectItems &&
                                    <SelectionAdorner
                                        adorners={this.adornersSelect}
                                        interactionService={this.interactionService}
                                        onSelectItems={onSelectItems}
                                        selectedDiagram={diagram}
                                        selectedItems={selectedItemsWithLocked} />
                                }

                                {onChangeItemsAppearance &&
                                    <TextAdorner
                                        interactionService={this.interactionService}
                                        onChangeItemsAppearance={onChangeItemsAppearance}
                                        selectedDiagram={diagram}
                                        selectedItems={selectedItems}
                                        zoom={zoom} />
                                }
                            </>
                        )}
                    </div>
                }
            </>
        );
    }
}
