import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux';
import * as React from 'react';

import { ImmutableList } from '@app/core'

import {
    changeItemsAppearance,
    Diagram,
    DiagramGroup,
    DiagramItem,
    DiagramShape,
    DiagramVisual,
    EditorState,
    getSelection,
    Renderer,
    RendererService,
    selectItems,
    Transform,
    transformItems,
    UndoableState
} from '@app/wireframes/model';

import { PaperCanvas } from './paper-canvas';

import { InteractionService }   from './interaction-service';
import { SelectionAdorner }     from './selection-adorner';
import { TextAdorner }          from './text-adorner';
import { TransformAdorner }     from './transform-adorner';

export interface EditorViewProps {
    // The renderer service.
    rendererService: RendererService;

    // The selected diagram.
    selectedDiagram: Diagram | null;

    // The selected items.
    selectedItems: DiagramItem[];

    // The width of the canvas.
    canvasWidth: number;

    // The height of the canvas.
    canvasHeight: number;

    // The zoom value of the canvas.
    canvasZoom: number;

    // A function to select a set of items.
    selectItems: (diagram: Diagram, itemIds: string[]) => void;

    // A function to change the appearance of a visual.
    changeItemsAppearance: (diagram: Diagram, visuals: DiagramVisual[], key: string, val: any) => void;

    // A function to transform a set of items.
    transformItems: (diagram: Diagram, items: DiagramItem[], oldBounds: Transform, newBounds: Transform) => void;
}

const mapStateToProps = (state: { editor: UndoableState<EditorState> }) => {
    const { editor, diagram, items} = getSelection(state);

    return {
        selectedDiagram: diagram,
        selectedItems: items,
        canvasWidth: editor.size.x,
        canvasHeight: editor.size.y,
        canvasZoom: 1
    };
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    selectItems, changeItemsAppearance, transformItems
}, dispatch);

class Editor extends React.Component<EditorViewProps, {}> {
    private adornerScope: paper.PaperScope;
    private diagramScope: paper.PaperScope;
    private diagramLayer: paper.Layer;
    private interactionService: InteractionService = new InteractionService();
    private shapeRefsById: { [id: string]: ShapeRef } = {};
    private shapeRefsByRenderElement: { [id: number]: ShapeRef } = {};

    public componentDidUpdate() {
        this.renderDiagram();
    }

    public initAdornerScope(scope: paper.PaperScope) {
        this.adornerScope = scope;

        this.forceUpdate();
    }

    public initDiagramScope(scope: paper.PaperScope) {
        this.diagramScope = scope;
        this.diagramScope.activate();
        this.diagramLayer = this.diagramScope.project.activeLayer;

        this.interactionService.init(scope);

        this.renderDiagram();
        this.forceUpdate();
    }

    private renderDiagram() {
        if (!this.diagramLayer) {
            return;
        }

        this.diagramScope.activate();
        this.diagramLayer.activate();
        this.diagramLayer.removeChildren();

        const allShapesById: { [id: string]: boolean } = {};

        const flattenShapes: DiagramShape[] = [];

        const diagram = this.props.selectedDiagram;

        if (diagram) {
            let handleContainer: (itemIds: ImmutableList<string>) => void;

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

            flattenShapes.forEach(item => allShapesById[item.id] = true);
        }

        for (let id in this.shapeRefsById) {
            if (this.shapeRefsById.hasOwnProperty(id)) {
                const ref = this.shapeRefsById[id];

                if (!allShapesById[id]) {
                    delete this.shapeRefsById[id];
                    delete this.shapeRefsByRenderElement[ref.renderedElement.id];
                }
            }
        }

        for (let shape of flattenShapes) {
            let ref = this.shapeRefsById[shape.id];

            if (!ref) {
                const renderer = this.props.rendererService.registeredRenderers[shape.renderer];

                ref = new ShapeRef(renderer, shape, false);
            } else {
                if (!ref.invalidate(shape)) {
                    ref.add(this.diagramLayer);
                }
            }

            this.shapeRefsByRenderElement[ref.renderedElement.id] = ref;
            this.shapeRefsById[shape.id] = ref;
        }
    }

    private provideItemByElement = (item: paper.Item): DiagramItem | null => {
        const ref = this.shapeRefsByRenderElement[item.id];

        return ref ? ref.shape : null;
    }

    public render() {
        return (
            <div className='editor-container'>
                <PaperCanvas onInit={(layer) => this.initDiagramScope(layer)}
                      zoom={this.props.canvasZoom}
                     width={this.props.canvasWidth}
                    height={this.props.canvasHeight} />

                <PaperCanvas onInit={(layer) => this.initAdornerScope(layer)} className='editor-adorners'
                    zoom={this.props.canvasZoom}
                    width={this.props.canvasWidth}
                    height={this.props.canvasHeight} />

                <div>
                    {this.adornerScope && this.props.selectedDiagram && (
                        <div>
                            <TransformAdorner
                                adornerScope={this.adornerScope}
                                interactionService={this.interactionService}
                                selectedDiagram={this.props.selectedDiagram}
                                selectedItems={this.props.selectedItems}
                                transformItems={this.props.transformItems} />

                            <SelectionAdorner
                                adornerScope={this.adornerScope}
                                interactionService={this.interactionService}
                                selectedDiagram={this.props.selectedDiagram}
                                selectedItems={this.props.selectedItems}
                                selectItems={this.props.selectItems}
                                provideItemByElement={this.provideItemByElement} />

                            <TextAdorner
                                changeItemsAppearance={this.props.changeItemsAppearance}
                                interactionService={this.interactionService}
                                selectedDiagram={this.props.selectedDiagram}
                                selectedItems={this.props.selectedItems}
                                provideItemByElement={this.provideItemByElement}
                                zoom={this.props.canvasZoom} />
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

class ShapeRef {
    public renderedElement: paper.Item;

    constructor(
        public renderer: Renderer,
        public shape: DiagramShape,
        public renderAdorners: boolean
    ) {
        this.render();
    }

    public invalidate(shape: DiagramShape): boolean {
        const mustRender = this.shape !== shape || !this.renderedElement;

        if (mustRender) {
            this.shape = shape;

            this.render();
        }

        return mustRender;
    }

    public add(layer: paper.Layer) {
        layer.addChild(this.renderedElement);
    }

    public render() {
        this.renderedElement = this.renderer.render(this.shape, this.renderAdorners);
    }
}

export const EditorContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Editor);