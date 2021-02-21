/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { RendererContext } from '@app/context';
import { sizeInPx } from '@app/core';
import { addIcon, addImage, addVisual, changeItemsAppearance, getDiagram, getDiagramId, getEditor, getSelectedItems, getSelectedItemsWithLocked, selectItems, Transform, transformItems, useStore } from '@app/wireframes/model';
import { Editor } from '@app/wireframes/renderer/Editor';
import * as React from 'react';
import { DropTargetMonitor, useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { useDispatch } from 'react-redux';
import { DiagramRef, ItemsRef } from '../model/actions/utils';

export interface EditorViewProps {
    // The spacing.
    spacing: number;
}

export const EditorView = ({ spacing }: EditorViewProps) => {
    const dispatch = useDispatch();
    const state = useStore(s => s);
    const selectedDiagramId = useStore(s => getDiagramId(s));
    const editor = useStore(s => getEditor(s));
    const editorSize = editor.size;
    const zoom = useStore(s => s.ui.zoom);
    const zoomedSize = editorSize.mul(zoom);
    const rendererService = React.useContext(RendererContext);

    const doChangeItemsAppearance = React.useCallback((diagram: DiagramRef, visuals: ItemsRef, key: string, value: any) => {
        dispatch(changeItemsAppearance(diagram, visuals, key, value));
    }, []);

    const doSelectItems = React.useCallback((diagram: DiagramRef, items: ItemsRef) => {
        dispatch(selectItems(diagram, items));
    }, []);

    const doTransformItems = React.useCallback((diagram: DiagramRef, items: ItemsRef, oldBounds: Transform, newBounds: Transform) => {
        dispatch(transformItems(diagram, items, oldBounds, newBounds));
    }, []);

    const ref = React.useRef();

    const [, drop] = useDrop({
        accept: [
            NativeTypes.URL,
            NativeTypes.FILE,
            NativeTypes.TEXT,
            'DND_ASSET',
            'DND_ICON',
        ],
        drop: (item: any, monitor: DropTargetMonitor) => {
            if (!monitor || !ref.current) {
                return;
            }

            let x = item.localX;
            let y = item.localY;

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

                    for (const file of files) {
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

                    for (const url of urls) {
                        dispatch(addVisual(selectedDiagramId, 'Link', x, y, { TEXT: url }));
                        break;
                    }
                    break;
                }
            }
        },
    });

    const zoomedOuterWidth  = 2 * spacing + zoomedSize.x;
    const zoomedOuterHeight = 2 * spacing + zoomedSize.y;

    const w = sizeInPx(zoomedOuterWidth);
    const h = sizeInPx(zoomedOuterHeight);

    const padding = sizeInPx(spacing);

    const style = { width: w, height: h, padding, margin: 'auto' };

    drop(ref);

    return (
        <div ref={ref} className='editor-view' style={style}>
            <Editor
                diagram={getDiagram(state)}
                rendererService={rendererService}
                onChangeItemsAppearance={doChangeItemsAppearance}
                onSelectItems={doSelectItems}
                onTransformItems={doTransformItems}
                selectedItems={getSelectedItems(state)}
                selectedItemsWithLocked={getSelectedItemsWithLocked(state)}
                viewSize={editor.size}
                zoom={zoom}
                zoomedSize={zoomedSize}
            />
        </div>
    );
};
