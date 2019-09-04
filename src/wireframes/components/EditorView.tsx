import * as React from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { NativeTypes } from 'react-dnd-html5-backend';

import { sizeInPx } from '@app/core';

import { RendererContext } from '@app/context';

import {
    addIcon,
    addImage,
    addVisual,
    EditorStateInStore,
    getDiagramId,
    getEditor,
    UIStateInStore
} from '@app/wireframes/model';

import { EditorContainer } from '@app/wireframes/renderer/Editor';

export interface EditorViewProps {
    // The width of the canvas.
    zoomedWidth: number;

    // The height of the canvas.
    zoomedHeight: number;

    // The zoom value of the canvas.
    zoom: number;

    // The spacing.
    spacing: number;

    // The selected diagram.
    selectedDiagramId: string;

    // Adds an icon.
    addIcon: (diagram: string, text: string, fontFamily: string, x: number, y: number) => any;

    // Adds a visual.
    addVisual: (diagram: string, renderer: string, x: number, y: number, properties?: object) => any;

    // Adds an image.
    addImage: (diagram: string, source: string, x: number, y: number, w: number, h: number) => any;
}

function AssetTarget(props: EditorViewProps, ref: React.RefObject<HTMLElement>) {
    return (item: any, monitor: DropTargetMonitor) => {
        if (!monitor || !ref.current) {
            return;
        }

        const offset = monitor.getSourceClientOffset() || monitor.getClientOffset()!;

        const componentRect = (findDOMNode(ref.current) as HTMLElement)!.getBoundingClientRect();

        let x = (offset.x - props.spacing - componentRect.left) / props.zoom;
        let y = (offset.y - props.spacing - componentRect.top) / props.zoom;

        if (item.offset) {
            x += item.offset.x;
            y += item.offset.y;
        }

        const itemType = monitor.getItemType();

        switch (itemType) {
            case 'DND_ICON':
                props.addIcon(props.selectedDiagramId, item.text, item.fontFamily, x, y);
                break;
            case 'DND_ASSET':
                props.addVisual(props.selectedDiagramId, item['shape'], x, y);
                break;
            case NativeTypes.TEXT:
                props.addVisual(props.selectedDiagramId, 'Label', x, y, { TEXT: item.text });
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
    };
}

const EditorView = (props: EditorViewProps) => {
    const renderer = React.useContext(RendererContext);

    const ref = React.useRef();

    const [, drop] = useDrop({
        accept: [
            NativeTypes.URL,
            NativeTypes.FILE,
            NativeTypes.TEXT,
            'DND_ASSET',
            'DND_ICON'
        ],
        drop: AssetTarget(props, ref)
    });

    const calculateStyle = () => {
        const {
            spacing,
            zoomedWidth,
            zoomedHeight
        } = props;

        const zoomedOuterWidth  = 2 * spacing + zoomedWidth;
        const zoomedOuterHeight = 2 * spacing + zoomedHeight;

        const w = sizeInPx(zoomedOuterWidth);
        const h = sizeInPx(zoomedOuterHeight);

        const padding = sizeInPx(spacing);

        return { width: w, height: h, padding, margin: 'auto' };
    };

    drop(ref);

    return (
        <div ref={ref} className='editor-view' style={calculateStyle()}>
            <EditorContainer rendererService={renderer} />
        </div>
    );
};

const mapStateToProps = (state: UIStateInStore & EditorStateInStore) => {
    const editor = getEditor(state);

    const zoom = state.ui.zoom;

    return {
        selectedDiagramId: getDiagramId(state),
        zoomedWidth: editor.size.x * zoom,
        zoomedHeight: editor.size.y * zoom,
        zoom: zoom
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    addIcon, addImage, addVisual
}, dispatch);

export const EditorViewContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(EditorView);