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
import { Canvas, loadImagesToClipboardItems, useClipboard, useEventCallback, ViewBox } from '@app/core';
import { useAppDispatch } from '@app/store';
import { ShapeSource } from '@app/wireframes/interface';
import { addShape, changeItemsAppearance, Diagram, getDiagram, getDiagramId, getEditor, getMasterDiagram, getSelection, PluginRegistry, selectItems, Transform, transformItems, useStore } from '@app/wireframes/model';
import { Editor } from '@app/wireframes/renderer/Editor';
import { DiagramRef, ItemsRef } from './../model/actions/utils';
import { useContextMenu } from './context-menu';
import './EditorView.scss';

export const EditorView = () => {
    const diagram = useStore(getDiagram);
    const editor = useStore(getEditor);

    if (!diagram) {
        return null;
    }

    return (
        <Canvas
            contentWidth={editor.size.x}
            contentHeight={editor.size.y}
            padding={10}
            onRender={viewBox => <EditorViewInner viewBox={viewBox} diagram={diagram} />} 
        />
    );
};

export const EditorViewInner = ({ diagram, viewBox }: { diagram: Diagram; viewBox: ViewBox }) => {
    const dispatch = useAppDispatch();
    const [menuVisible, setMenuVisible] = React.useState(false);
    const editor = useStore(getEditor);
    const editorColor = editor.color;
    const masterDiagram = useStore(getMasterDiagram);
    const renderRef = React.useRef<any>();
    const selectedDiagramId = useStore(getDiagramId);
    const selectedPoint = React.useRef({ x: 0, y: 0 });
    const state = useStore(s => s);
    const contextMenu = useContextMenu(menuVisible);

    const doChangeItemsAppearance = useEventCallback((diagram: DiagramRef, visuals: ItemsRef, key: string, value: any) => {
        dispatch(changeItemsAppearance(diagram, visuals, key, value));
    });

    const doSelectItems = useEventCallback((diagram: DiagramRef, items: ItemsRef) => {
        dispatch(selectItems(diagram, items));
    });

    const doTransformItems = useEventCallback((diagram: DiagramRef, items: ItemsRef, oldBounds: Transform, newBounds: Transform) => {
        dispatch(transformItems(diagram, items, oldBounds, newBounds));
    });

    const doSetPosition = useEventCallback((event: React.MouseEvent) => {
        selectedPoint.current = { x: event.nativeEvent.offsetX, y: event.nativeEvent.offsetY };
    });

    const doPaste = useEventCallback((sources: ReadonlyArray<ShapeSource>, x: number, y: number) => {
        if (!selectedDiagramId) {
            return;
        }

        const shapes = PluginRegistry.createShapes(sources);

        for (const { appearance, renderer, size } of shapes) {
            dispatch(addShape(selectedDiagramId, renderer, { position: { x, y }, size, appearance }));

            x += 40;
            y += 40;
        }
    });

    useClipboard({
        onPaste: event => {
            if (!selectedDiagramId) {
                return;
            }
    
            const x = selectedPoint.current.x;
            const y = selectedPoint.current.y;

            doPaste(event.items, x, y);
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
        drop: async (item: any, monitor: DropTargetMonitor) => {
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

            // Convert to the space of the element
            const relativeX = (offset?.x || 0) - componentRect.left;
            const relativeY = (offset?.y || 0) - componentRect.top;

            const x = relativeX / viewBox.zoom + viewBox.minX;
            const y = relativeY / viewBox.zoom + viewBox.minY;

            const itemType = monitor.getItemType();

            switch (itemType) {
                case 'DND_ASSET':
                    dispatch(addShape(selectedDiagramId, item['name'], { position: { x, y } }));
                    break;
                case 'DND_ICON':
                    doPaste([{ type: 'Icon', ...item }], x, y);
                    break;
                case NativeTypes.TEXT:
                    doPaste([{ type: 'Text', ...item }], x, y);
                    break;
                case NativeTypes.URL: {
                    const urls: string[] = item.urls;

                    doPaste(urls.map(url => ({ type: 'Url', url })), x, y);
                    break;
                }
                case NativeTypes.FILE: {
                    const files: FileList | File[] = item.files;

                    doPaste(await loadImagesToClipboardItems(files), x, y);
                    break;
                }
            }
        },
    });

    drop(renderRef);

    return (
        <Dropdown rootClassName='editor-dropdown' menu={contextMenu} trigger={['contextMenu']} onOpenChange={setMenuVisible}>            
            <div className='editor-view' onClick={doSetPosition}>
                <div className='editor-diagram' ref={renderRef} >
                    <Editor
                        color={editorColor}
                        diagram={diagram}
                        isDefaultView={true}
                        masterDiagram={masterDiagram}
                        onChangeItemsAppearance={doChangeItemsAppearance}
                        onSelectItems={doSelectItems}
                        onTransformItems={doTransformItems}
                        selectionSet={getSelection(state)}
                        useWebGL={state.ui.useWebGL}
                        viewBox={viewBox}
                        viewSize={editor.size}
                    />
                </div>
            </div>
        </Dropdown>
    );
};
