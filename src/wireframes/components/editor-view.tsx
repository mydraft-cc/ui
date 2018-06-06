import * as React from 'react';
import { DropTarget, DropTargetCollector, DropTargetSpec } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { sizeInPx } from '@app/core';

import {
    addIcon,
    addImage,
    addVisual,
    EditorStateInStore,
    getSelection,
    RendererService,
    UIStateInStore
} from '@app/wireframes/model';

import { EditorContainer } from '@app/wireframes/renderer/editor';
import { NativeTypes } from 'react-dnd-html5-backend';

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
    selectedDiagramId: string;

    // Adds an icon.
    addIcon: (diagram: string, char: string, x: number, y: number) => any;

    // Adds a visual.
    addVisual: (diagram: string, renderer: string, x: number, y: number, properties?: object) => any;

    // Adds an image.
    addImage: (diagram: string, source: string, x: number, y: number, w: number, h: number) => any;
}

const mapStateToProps = (state: UIStateInStore & EditorStateInStore) => {
    const { editor } = getSelection(state);

    return {
        selectedDiagramId: editor.selectedDiagramId,
        zoomedWidth: editor.size.x * state.ui.zoom,
        zoomedHeight: editor.size.y * state.ui.zoom,
        zoom: state.ui.zoom
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    addIcon, addImage, addVisual
}, dispatch);

const AssetTarget: DropTargetSpec<EditorViewProps> = {
    drop: (props, monitor, component) => {
        if (!monitor) {
            return;
        }

        const offset = monitor.getSourceClientOffset() || monitor.getClientOffset();

        const componentRect = (findDOMNode(component!) as HTMLElement)!.getBoundingClientRect();

        const x = (offset.x - props.spacing - componentRect.left) / props.zoom;
        const y = (offset.y - props.spacing - componentRect.top) / props.zoom;

        const itemType = monitor.getItemType();
        const item: any = monitor.getItem();

        switch (itemType) {
            case 'DND_ICON':
                props.addIcon(props.selectedDiagramId, item['icon'], x, y);
                break;
            case 'DND_ASSET':
                props.addVisual(props.selectedDiagramId, item['shape'], x, y);
                break;
            case NativeTypes.TEXT:
                props.addVisual(props.selectedDiagramId, 'Label', x, y, { TEXT: item['text'] });
                break;
            case NativeTypes.FILE: {
                const files = item.files as File[];

                for (let file of files) {
                    if (file.type.indexOf('image') === 0) {
                        const reader = new FileReader();

                        reader.onload = (loadedFile: any) => {
                            const imageSource: string = loadedFile.target.result;
                            const imageElement = document.createElement('img');

                            imageElement.onload = () => {
                                props.addImage(props.selectedDiagramId, imageSource, x, y, imageElement.width, imageElement.height);
                            };
                            imageElement.src = imageSource;
                        };
                        reader.readAsDataURL(file);
                        break;
                    }
                }
                break;
            }
            case NativeTypes.URL: {
                const urls = item.urls as string[];

                for (let url of urls) {
                    props.addVisual(props.selectedDiagramId, 'Link', x, y, { TEXT: url });
                    break;
                }
                break;
            }
        }
    }
};

const EditorViewConnect: DropTargetCollector = (connector, monitor) => {
    return { connectDropTarget: connector.dropTarget() };
};

@DropTarget([
    NativeTypes.URL,
    NativeTypes.FILE,
    NativeTypes.TEXT,
    'DND_ASSET',
    'DND_ICON'
], AssetTarget, EditorViewConnect)
class EditorView extends React.Component<EditorViewProps> {
    public render() {
        const calculateStyle = () => {
            const zoomedOuterWidth = 2 * this.props.spacing + this.props.zoomedWidth;
            const zoomedOuterHeight = 2 * this.props.spacing + this.props.zoomedHeight;

            const w = sizeInPx(zoomedOuterWidth);
            const h = sizeInPx(zoomedOuterHeight);

            const padding = sizeInPx(this.props.spacing);

            return { width: w, height: h, padding, margin: 'auto' };
        };

        return this.props.connectDropTarget(
            <div className='editor-view' style={calculateStyle()}>
                <EditorContainer rendererService={this.props.rendererService} />
            </div>
        );
    }
}

export const EditorViewContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(EditorView);