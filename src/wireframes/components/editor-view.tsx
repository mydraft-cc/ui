import * as React from 'react';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { DropTarget, DropTargetSpec, DropTargetCollector } from 'react-dnd';

import { MathHelper, sizeInPx } from '@app/core';

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

const AssetTarget: DropTargetSpec<EditorViewProps> = {
    canDrop: props => {
        return !!props.selectedDiagram;
    },
    drop: (props, monitor, component) => {
        const clientOffset = monitor!.getSourceClientOffset();

        const componentRect = (findDOMNode(component!) as HTMLElement)!.getBoundingClientRect();

        const x = (clientOffset.x - props.spacing - componentRect.left) / props.zoom;
        const y = (clientOffset.y - props.spacing - componentRect.top) / props.zoom;

        const item: any = monitor!.getItem();

        if (item.icon) {
            props.addIcon(props.selectedDiagram!, item.icon, x, y, MathHelper.guid());
        } else if (item.shape) {
            props.addVisual(props.selectedDiagram!, item.shape, x, y, MathHelper.guid());
        }
    }
};

const EditorViewConnect: DropTargetCollector = (connector, monitor) => {
    return { connectDropTarget: connector.dropTarget() };
};

@DropTarget('DND_ASSET', AssetTarget, EditorViewConnect)
class EditorView extends React.Component<EditorViewProps> {
    public render() {
        const zoomedOuterWidth  = 2 * this.props.spacing + this.props.zoomedWidth;
        const zoomedOuterHeight = 2 * this.props.spacing + this.props.zoomedHeight;

        return this.props.connectDropTarget(
            <div className='editor-view' style={{ width: sizeInPx(zoomedOuterWidth), height: sizeInPx(zoomedOuterHeight), padding: sizeInPx(this.props.spacing) }}>
                <EditorContainer rendererService={this.props.rendererService} />
            </div>
        );
    }
}

export const EditorViewContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(EditorView);