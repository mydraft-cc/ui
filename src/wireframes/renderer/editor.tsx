import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import * as svg from 'svg.js';

import './editor.scss';

import { ImmutableList, sizeInPx, Vec2 } from '@app/core';

import {
    changeItemsAppearance,
    Diagram,
    DiagramGroup,
    DiagramItem,
    DiagramShape,
    DiagramVisual,
    EditorStateInStore,
    getSelection,
    Renderer,
    RendererService,
    selectItems,
    Transform,
    transformItems,
    UIStateInStore
} from '@app/wireframes/model';

import { CanvasView }           from './canvas-view';
import { InteractionService }   from './interaction-service';
import { SelectionAdorner }     from './selection-adorner';
import { TextAdorner }          from './text-adorner';
import { TransformAdorner }     from './transform-adorner';

export interface EditorProps {
    // The renderer service.
    rendererService: RendererService;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];

    // The width of the canvas.
    zoomedWidth: number;

    // The height of the canvas.
    zoomedHeight: number;

    // The zoom value of the canvas.
    zoom: number;

    // The view size of the editor.
    viewSize: Vec2;

    // A function to select a set of items.
    selectItems: (diagram: Diagram, itemIds: string[]) => any;

    // A function to change the appearance of a visual.
    changeItemsAppearance: (diagram: Diagram, visuals: DiagramVisual[], key: string, val: any) => any;

    // A function to transform a set of items.
    transformItems: (diagram: Diagram, items: DiagramItem[], oldBounds: Transform, newBounds: Transform) => any;
}

const mapStateToProps = (state: UIStateInStore & EditorStateInStore) => {
    const { editor, diagram, items} = getSelection(state);

    return {
        selectedDiagram: diagram,
        selectedItems: items,
        viewSize: editor.size,
        zoomedWidth: editor.size.x * state.ui.zoom,
        zoomedHeight: editor.size.y * state.ui.zoom,
        zoom: state.ui.zoom
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    selectItems, changeItemsAppearance, transformItems
}, dispatch);

const showDebugOutlines = process.env.NODE_ENV === 'false';

class Editor extends React.Component<EditorProps> {
    private adornersSelect: svg.Container;
    private adornersTransform: svg.Container;
    private diagramTools: svg.Element;
    private diagramRendering: svg.Container;
    private interactionService: InteractionService;
    private shapeRefsById: { [id: string]: ShapeRef } = {};

    public componentDidUpdate() {
        this.renderDiagram();
    }

    public initDiagramScope(doc: svg.Doc) {
        this.diagramTools = doc.rect().fill('transparent');
        this.diagramRendering = doc.group();
        this.adornersSelect = doc.group();
        this.adornersTransform = doc.group();

        this.interactionService = new InteractionService([this.adornersSelect, this.adornersTransform], this.diagramRendering, doc);

        this.renderDiagram();

        this.forceUpdate();
    }

    private renderDiagram() {
        if (!this.interactionService) {
            return;
        }

        const allShapesById: { [id: string]: boolean } = {};
        const allShapes = this.getFlattenShapes();

        allShapes.forEach(item => allShapesById[item.id] = true);

        for (let id in this.shapeRefsById) {
            if (this.shapeRefsById.hasOwnProperty(id)) {
                const ref = this.shapeRefsById[id];

                ref.remove();

                if (!allShapesById[id]) {
                    delete this.shapeRefsById[id];
                }
            }
        }

        for (let shape of allShapes) {
            let ref = this.shapeRefsById[shape.id];

            if (!ref) {
                const renderer = this.props.rendererService.registeredRenderers[shape.renderer];

                ref = new ShapeRef(this.diagramRendering, renderer, showDebugOutlines);
            }

            ref.render(shape);

            this.shapeRefsById[shape.id] = ref;
        }
    }

    private getFlattenShapes() {
        const flattenShapes: DiagramShape[] = [];

        const diagram = this.props.selectedDiagram;

        if (diagram) {
            let handleContainer: (itemIds: ImmutableList<string>) => any;

            handleContainer = itemIds => {
                itemIds.forEach(itemId => {
                    const item = diagram.items.get(itemId);

                    if (item) {
                        if (item instanceof DiagramShape) {
                            flattenShapes.push(item);
                        }

                        if (item instanceof DiagramGroup) {
                            handleContainer(item.childIds);
                        }
                    }
                });
            };

            handleContainer(diagram.rootIds);
        }

        return flattenShapes;
    }

    public render() {
        const w = this.props.zoomedWidth;
        const h = this.props.zoomedHeight;

        if (this.interactionService) {
            this.diagramTools.size(w, h);
            this.adornersSelect.size(w, h);
            this.adornersTransform.size(w, h);
            this.diagramRendering.size(w, h);
        }

        return (
            <div className='editor' style={{ position: 'relative', width: sizeInPx(w), height: sizeInPx(h) }}>
                <CanvasView onInit={(doc) => this.initDiagramScope(doc)}
                    zoom={this.props.zoom}
                    zoomedWidth={this.props.zoomedWidth}
                    zoomedHeight={this.props.zoomedHeight} />

                {this.interactionService && this.props.selectedDiagram && (
                    <>
                        <TransformAdorner
                            adorners={this.adornersTransform}
                            interactionService={this.interactionService}
                            selectedDiagram={this.props.selectedDiagram}
                            selectedItems={this.props.selectedItems}
                            transformItems={this.props.transformItems}
                            viewSize={this.props.viewSize}
                            zoom={this.props.zoom} />

                        <SelectionAdorner
                            adorners={this.adornersSelect}
                            interactionService={this.interactionService}
                            selectedDiagram={this.props.selectedDiagram}
                            selectedItems={this.props.selectedItems}
                            selectItems={this.props.selectItems} />

                        <TextAdorner
                            changeItemsAppearance={this.props.changeItemsAppearance}
                            interactionService={this.interactionService}
                            selectedDiagram={this.props.selectedDiagram}
                            selectedItems={this.props.selectedItems}
                            zoom={this.props.zoom} />
                    </>
                )}
            </div>
        );
    }
}

class ShapeRef {
    private shape: DiagramShape;

    public renderedElement: svg.Element;

    public get renderId() {
        return this.renderedElement.id();
    }

    constructor(
        public readonly doc: svg.Container,
        public renderer: Renderer,
        public showDebugMarkers: boolean
    ) {
    }

    public remove() {
        if (this.renderedElement) {
            this.renderedElement.remove();
        }
    }

    public render(shape: DiagramShape) {
        const mustRender = this.shape !== shape || !this.renderedElement;

        if (mustRender) {
            this.renderer.setContext(this.doc);

            this.renderedElement = this.renderer.render(shape, this.showDebugMarkers);
            this.renderedElement.node['shape'] = shape;
        } else {
            this.doc.add(this.renderedElement);
        }

        this.shape = shape;
    }
}

export const EditorContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Editor);