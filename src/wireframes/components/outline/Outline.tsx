/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { useDispatch } from 'react-redux';
import { useEventCallback } from '@app/core';
import { getDiagram, moveItems, removeItems, renameItems, selectItems, useStore } from '@app/wireframes/model';
import './Outline.scss';
import { OutlineItem } from './OutlineItem';

export const Outline = () => {
    const dispatch = useDispatch();
    const diagram = useStore(getDiagram);

    const doRemoveDiagram = useEventCallback((itemId: string) => {
        dispatch(removeItems(diagram!, [itemId]));
    });

    const doRenameDiagram = useEventCallback((itemId: string, name: string) => {
        dispatch(renameItems(diagram!, [itemId], name));
    });

    const doSelect = useEventCallback((itemId: string) => {
        dispatch(selectItems(diagram!, [itemId]));
    });

    const doSort = useEventCallback((result: DropResult) => {
        dispatch(moveItems(diagram!, [result.draggableId], result.destination!.index));
    });

    if (!diagram) {
        return null;
    }

    return (
        <>
            <DragDropContext onDragEnd={doSort}>
                <Droppable droppableId='droppable'>
                    {(provided) => (
                        <div className='pages-list' {...provided.droppableProps} ref={provided.innerRef}>
                            {diagram.rootItems.map((item, index) =>
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}>
                                            <OutlineItem
                                                diagram={diagram}
                                                diagramItem={item}
                                                level={0}
                                                onDelete={doRemoveDiagram}
                                                onRename={doRenameDiagram}
                                                onSelect={doSelect}
                                            />
                                        </div>
                                    )}
                                </Draggable>,
                            )}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        </>
    );
};
