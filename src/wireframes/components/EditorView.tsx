/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Dropdown } from 'antd';
import * as React from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { findDOMNode } from 'react-dom';
import { useDispatch } from 'react-redux';
import { RendererContext } from '@app/context';
import { loadImage, sizeInPx, useClipboard, useEventCallback } from '@app/core';
import { addIcon, addImage, addVisual, changeItemsAppearance, Diagram, getDiagram, getDiagramId, getEditor, getMasterDiagram, getSelectedItems, getSelectedItemsWithLocked, selectItems, Transform, transformItems, useStore } from '@app/wireframes/model';
import { Editor } from '@app/wireframes/renderer/Editor';
import { DiagramRef, ItemsRef } from '../model/actions/utils';
import { ContextMenu } from './context-menu/ContextMenu';
import './EditorView.scss';

export interface EditorViewProps {
    // The spacing.
    spacing: number;
}

export const EditorView = (props: EditorViewProps) => {
    const diagram = useStore(getDiagram);

    if (!diagram) {
        return null;
    }

    return (
        <EditorViewInner {...props} diagram={diagram} />
    );
};

export const EditorViewInner = ({ diagram, spacing }: EditorViewProps & { diagram: Diagram }) => {
    const dispatch = useDispatch();
    const editor = useStore(getEditor);
    const editorColor = editor.color;
    const editorSize = editor.size;
    const masterDiagram = useStore(getMasterDiagram);
    const renderRef = React.useRef<any>();
    const renderer = React.useContext(RendererContext);
    const selectedPoint = React.useRef({ x: 0, y: 0 });
    const selectedDiagramId = useStore(getDiagramId);
    const state = useStore(s => s);
    const zoom = useStore(s => s.ui.zoom);
    const zoomedSize = editorSize.mul(zoom);
    const [menuVisible, setMenuVisible] = React.useState(false);

    const doChangeItemsAppearance = useEventCallback((diagram: DiagramRef, visuals: ItemsRef, key: string, value: any) => {
        dispatch(changeItemsAppearance(diagram, visuals, key, value));
    });

    const doSelectItems = useEventCallback((diagram: DiagramRef, items: ItemsRef) => {
        dispatch(selectItems(diagram, items));
    });

    const doTransformItems = useEventCallback((diagram: DiagramRef, items: ItemsRef, oldBounds: Transform, newBounds: Transform) => {
        dispatch(transformItems(diagram, items, oldBounds, newBounds));
    });

    const doHide = useEventCallback(() => {
        setMenuVisible(false);
    });

    const doSetPosition = useEventCallback((event: React.MouseEvent) => {
        selectedPoint.current = { x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY };
    });

    const addImages = useEventCallback((files: File[] | FileList | undefined, x: number, y: number) => {
        if (!selectedDiagramId || !files) {
            return;
        }

        async function loadFiles(diagramId: string, files: File[]) {
            for (const file of files) {
                const image = await loadImage(file);

                if (image != null) {
                    dispatch(addImage(diagramId, image.source, x, y, image.width, image.height));
                }
            }
        }

        loadFiles(selectedDiagramId, Array.from(files));
    });

    const addUrls = useEventCallback((urls: string[] | undefined, x: number, y: number) => {
        if (!selectedDiagramId || !urls) {
            return;
        }

        for (const url of urls) {
            dispatch(addVisual(selectedDiagramId, 'Link', x, y, { TEXT: url }));
            break;
        }
    });

    useClipboard({
        onPaste: event => {
            if (!selectedDiagramId) {
                return;
            }
    
            const x = selectedPoint.current.x;
            const y = selectedPoint.current.y;
    
            if (event.type === 'Text') {
                dispatch(addVisual(selectedDiagramId, 'Link', x, y, { TEXT: event.text }));
            } else if (event.images) {
                const image = event.images[0];
    
                dispatch(addImage(selectedDiagramId, image.source, x, y, image.width, image.height));
            }
        },
    });

    const [, drop] = useDrop({
        accept: [
            NativeTypes.URL,
            NativeTypes.FILE,
            NativeTypes.TEXT,
            'DND_ASSET',
            'DND_ICON',
        ],
        drop: (item: any, monitor: DropTargetMonitor) => {
            if (!monitor || !renderRef.current || !selectedDiagramId) {
                return;
            }

            let offset = monitor.getSourceClientOffset();

            if (!offset) {
                offset = monitor.getClientOffset();
            }

            if (!offset) {
                return;
            }

            const componentRect = (findDOMNode(renderRef.current) as HTMLElement)!.getBoundingClientRect();

            let x = ((offset?.x || 0) - spacing - componentRect.left) / zoom;
            let y = ((offset?.y || 0) - spacing - componentRect.top) / zoom;

            const itemType = monitor.getItemType();

            switch (itemType) {
                case 'DND_ICON':
                    dispatch(addIcon(selectedDiagramId, item.text, item.fontFamily, x, y));
                    break;
                case 'DND_ASSET':
                    dispatch(addVisual(selectedDiagramId, item['name'], x, y));
                    break;
                case NativeTypes.TEXT:
                    dispatch(addVisual(selectedDiagramId, 'Label', x, y, { TEXT: item.text }));
                    break;
                case NativeTypes.FILE: {
                    addImages(item.files, x, y);
                    break;
                }
                case NativeTypes.URL: {
                    addUrls(item.urls, x, y);
                    break;
                }
            }
        },
    });

    drop(renderRef);

    const zoomedOuterWidth = 2 * spacing + zoomedSize.x;
    const zoomedOuterHeight = 2 * spacing + zoomedSize.y;

    const w = sizeInPx(zoomedOuterWidth);
    const h = sizeInPx(zoomedOuterHeight);

    const padding = sizeInPx(spacing);

    return (
        <Dropdown overlay={<ContextMenu onClick={doHide} />} trigger={['contextMenu']} visible={menuVisible} onVisibleChange={setMenuVisible}>            
            <div className='editor-view' onClick={doSetPosition}>
                <div className='editor-diagram' style={{ width: w, height: h, padding }} ref={renderRef} >
                    <Editor
                        color={editorColor}
                        diagram={diagram}
                        masterDiagram={masterDiagram}
                        onChangeItemsAppearance={doChangeItemsAppearance}
                        onSelectItems={doSelectItems}
                        onTransformItems={doTransformItems}
                        rendererService={renderer}
                        selectedItems={getSelectedItems(state)}
                        selectedItemsWithLocked={getSelectedItemsWithLocked(state)}
                        viewSize={editor.size}
                        zoom={zoom}
                        zoomedSize={zoomedSize}
                    />
                </div>
            </div>
        </Dropdown>
    );
};
