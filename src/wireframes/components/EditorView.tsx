import * as React from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { findDOMNode } from 'react-dom';
import { useDispatch } from 'react-redux';

import { sizeInPx } from '@app/core';

import { RendererContext } from '@app/context';

import {
    addIcon,
    addImage,
    addVisual,
    getDiagramId,
    getEditor,
    useStore
} from '@app/wireframes/model';

import { EditorContainer } from '@app/wireframes/renderer/Editor';

export interface EditorViewProps {
    // The spacing.
    spacing: number;
}

export const EditorView = ({ spacing }: EditorViewProps) => {
    const dispatch = useDispatch();
    const selectedDiagramId = useStore(s => getDiagramId(s));
    const editor = useStore(s => getEditor(s));
    const editorSize = editor.size;
    const zoom = useStore(s => s.ui.zoom);
    const zoomedWidth = editorSize.x * zoom;
    const zoomedHeight = editorSize.y * zoom;
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
        drop: (item: any, monitor: DropTargetMonitor) => {
            if (!monitor || !ref.current) {
                return;
            }

            const offset = monitor.getSourceClientOffset() || monitor.getClientOffset()!;

            const componentRect = (findDOMNode(ref.current) as HTMLElement)!.getBoundingClientRect();

            let x = (offset.x - spacing - componentRect.left) / zoom;
            let y = (offset.y - spacing - componentRect.top) / zoom;

            if (item.offset) {
                x += item.offset.x;
                y += item.offset.y;
            }

            const itemType = monitor.getItemType();

            switch (itemType) {
                case 'DND_ICON':
                    dispatch(addIcon(selectedDiagramId, item.text, item.fontFamily, x, y));
                    break;
                case 'DND_ASSET':
                    dispatch(addVisual(selectedDiagramId, item['shape'], x, y));
                    break;
                case NativeTypes.TEXT:
                    dispatch(addVisual(selectedDiagramId, 'Label', x, y, { TEXT: item.text }));
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
                                    dispatch(addImage(selectedDiagramId, imageSource, x, y, imageElement.width, imageElement.height));
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
                        dispatch(addVisual(selectedDiagramId, 'Link', x, y, { TEXT: url }));
                        break;
                    }
                    break;
                }
            }
        }
    });

    const zoomedOuterWidth  = 2 * spacing + zoomedWidth;
    const zoomedOuterHeight = 2 * spacing + zoomedHeight;

    const w = sizeInPx(zoomedOuterWidth);
    const h = sizeInPx(zoomedOuterHeight);

    const padding = sizeInPx(spacing);

    const style = { width: w, height: h, padding, margin: 'auto' };

    drop(ref);

    return (
        <div ref={ref} className='editor-view' style={style}>
            <EditorContainer rendererService={renderer} />
        </div>
    );
};