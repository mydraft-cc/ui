import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { DropTarget, DropTargetSpec, DropTargetCollector } from 'react-dnd';

import { MathHelper } from '@app/core';

import {
    addIcon,
    addVisual,
    Diagram,
    EditorState,
    getSelection,
    RendererService,
    UIState,
    UndoableState
} from '@app/wireframes/model';

import { EditorContainer } from '@app/wireframes/renderer/editor';

export interface EditorViewProps {
    // The renderer service.
    rendererService: RendererService;

    // The width of the canvas.
    zoomedWidth: number;

    // The height of the canvas.
    zoomedHeight: number;

    // The zoom value of the canvas.
    zoom: number;

    // The spacing.
    spacing: number;

    // The drop target.
    connectDropTarget?: any;

    // The selected diagram.
    selectedDiagram: Diagram | null;

    // Adds an icon.
    addIcon: (diagram: Diagram, char: string, x: number, y: number, shapeId: string) => any;

    // Adds a visual.
    addVisual: (diagram: Diagram, renderer: string, x: number, y: number, shapeId: string) => any;
}

const mapStateToProps = (state: { ui: UIState, editor: UndoableState<EditorState> }) => {
    const { editor, diagram } = getSelection(state);

    return {
        selectedDiagram: diagram,
        zoomedWidth: editor.size.x * state.ui.zoom,
        zoomedHeight: editor.size.y * state.ui.zoom,
        zoom: state.ui.zoom
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    addIcon, addVisual
}, dispatch);

const IconTarget: DropTargetSpec<EditorViewProps> = {
    canDrop: props => {
        return !!props.selectedDiagram;
    },
    drop: (props, monitor, component) => {
        const { x, y } = calculateSize(monitor, component, props);

        props.addIcon(props.selectedDiagram!, monitor!.getItem()['text'], x, y, MathHelper.guid());
    }
};

const ShapeTarget: DropTargetSpec<EditorViewProps> = {
    canDrop: props => {
        return !!props.selectedDiagram;
    },
    drop: (props, monitor, component) => {
        const { x, y } = calculateSize(monitor, component, props);

        props.addVisual(props.selectedDiagram!, monitor!.getItem()['type'], x, y, MathHelper.guid());
    }
};

const EditorViewConnect: DropTargetCollector = (connector, monitor) => {
    return { connectDropTarget: connector.dropTarget() };
};

@DropTarget('DND_SHAPE', ShapeTarget, EditorViewConnect)
@DropTarget('DND_ICON', IconTarget, EditorViewConnect)
class EditorView extends React.Component<EditorViewProps> {
    public render() {
        const zoomedOuterWidth  = 2 * this.props.spacing + this.props.zoomedWidth;
        const zoomedOuterHeight = 2 * this.props.spacing + this.props.zoomedHeight;

        const size = (value: number) => {
            return value + 'px';
        };

        return this.props.connectDropTarget(
            <div className='editor-view' style={{ width: size(zoomedOuterWidth), height: size(zoomedOuterHeight), padding: size(this.props.spacing) }}>
                <EditorContainer rendererService={this.props.rendererService} />
            </div>
        );
    }
}

export const EditorViewContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(EditorView);

function calculateSize(monitor: __ReactDnd.DropTargetMonitor | undefined, component: React.Component<EditorViewProps, {}> | undefined, props: EditorViewProps) {
    const clientOffset = monitor!.getSourceClientOffset();

    const componentRect = findDOMNode(component!).getBoundingClientRect();

    const x = (clientOffset.x - props.spacing - componentRect.left) / props.zoom;
    const y = (clientOffset.y - props.spacing - componentRect.top) / props.zoom;

    return { x, y };
}
