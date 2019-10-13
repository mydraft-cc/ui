import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import * as svg from 'svg.js';

import './Editor.scss';

import { sizeInPx, Vec2 } from '@app/core';

import {
    changeItemsAppearance,
    Diagram,
    DiagramContainer,
    DiagramItem,
    EditorStateInStore,
    getDiagram,
    getEditor,
    getSelectedItems,
    getSelectedItemsWithLocked,
    RendererService,
    selectItems,
    Transform,
    transformItems,
    UIStateInStore
} from '@app/wireframes/model';

import { CanvasView }           from './CanvasView';
import { InteractionService }   from './interaction-service';
import { SelectionAdorner }     from './SelectionAdorner';
import { ShapeRef }             from './shape-ref';
import { TextAdorner }          from './TextAdorner';
import { TransformAdorner }     from './TransformAdorner';

export interface EditorProps {
    // The renderer service.
    rendererService: RendererService;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectedItems: DiagramItem[];

    // The selected items including locked items.
    selectedItemsWithLocked: DiagramItem[];

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
    changeItemsAppearance: (diagram: Diagram, visuals: DiagramItem[], key: string, val: any) => any;

    // A function to transform a set of items.
    transformItems: (diagram: Diagram, items: DiagramItem[], oldBounds: Transform, newBounds: Transform) => any;
}

const showDebugOutlines = process.env.NODE_ENV === 'false';

class Editor extends React.Component<EditorProps> {
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
    }

    private forceRender() {
        if (!this.interactionService) {
            return;
        }

        const allShapesById: { [id: string]: boolean } = {};
        const allShapes = this.getOrderedShapes();

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

    private getOrderedShapes() {
        const flattenShapes: DiagramItem[] = [];

        const diagram = this.props.selectedDiagram;

        if (diagram) {
            let handleContainer: (itemIds: DiagramContainer) => any;

            handleContainer = itemIds => {
                for (let id of itemIds.values) {
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
            changeItemsAppearance,
            selectedDiagram,
            selectedItems,
            selectItems,
            selectedItemsWithLocked,
            transformItems,
            zoom,
            zoomedHeight,
            zoomedWidth,
            viewSize
        } = this.props;

        const w = viewSize.x;
        const h = viewSize.y;

        if (this.interactionService) {
            this.diagramTools.size(w, h);
            this.adornersSelect.size(w, h);
            this.adornersTransform.size(w, h);
            this.diagramRendering.size(w, h);
        }

        return (
            <>
                {selectedDiagram &&
                    <div className='editor' style={{ position: 'relative', width: sizeInPx(w), height: sizeInPx(h) }}>
                        <CanvasView onInit={this.initDiagramScope}
                            zoom={zoom}
                            zoomedWidth={zoomedWidth}
                            zoomedHeight={zoomedHeight} />

                        {this.interactionService && selectedDiagram && (
                            <>
                                <TransformAdorner
                                    adorners={this.adornersTransform}
                                    interactionService={this.interactionService}
                                    selectedDiagram={selectedDiagram}
                                    selectedItems={selectedItems}
                                    transformItems={transformItems}
                                    viewSize={viewSize}
                                    zoom={zoom} />

                                <SelectionAdorner
                                    adorners={this.adornersSelect}
                                    interactionService={this.interactionService}
                                    selectedDiagram={selectedDiagram}
                                    selectedItems={selectedItemsWithLocked}
                                    selectItems={selectItems} />

                                <TextAdorner
                                    changeItemsAppearance={changeItemsAppearance}
                                    interactionService={this.interactionService}
                                    selectedDiagram={selectedDiagram}
                                    selectedItems={selectedItems}
                                    zoom={zoom} />
                            </>
                        )}
                    </div>
                }
            </>
        );
    }
}

const mapStateToProps = (state: UIStateInStore & EditorStateInStore) => {
    const editor = getEditor(state);

    return {
        selectedDiagram: getDiagram(state),
        selectedItems: getSelectedItems(state),
        selectedItemsWithLocked: getSelectedItemsWithLocked(state),
        viewSize: editor.size,
        zoomedWidth: editor.size.x * state.ui.zoom,
        zoomedHeight: editor.size.y * state.ui.zoom,
        zoom: state.ui.zoom
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    selectItems, changeItemsAppearance, transformItems
}, dispatch);

export const EditorContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(Editor);