/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { useEventCallback } from '@app/core';
import { useAppDispatch } from '@app/store';
import { getDiagram, moveItems, orderItems, removeItems, renameItems, selectItems, useStore } from '@app/wireframes/model';
import { OutlineItem, OutlineItemAction } from './OutlineItem';
import './Outline.scss';

export const Outline = () => {
    const dispatch = useAppDispatch();
    const diagram = useStore(getDiagram);

    const doAction = useEventCallback((itemId: string, action: OutlineItemAction, arg?: any) => {
        switch (action) {
            case 'Delete':
                dispatch(removeItems(diagram!, [itemId]));
                break;
            case 'Move':
                dispatch(orderItems(arg, diagram!, [itemId]));
                break;
            case 'Rename':
                dispatch(renameItems(diagram!, [itemId], arg));
                break;
            case 'Select':
                dispatch(selectItems(diagram!, [itemId]));
                break;

        }
    });

    const doSort = useEventCallback((result: DropResult) => {
        dispatch(moveItems(diagram!, [result.draggableId], result.destination!.index));
    });

    if (!diagram) {
        return null;
    }

    const rootItems = diagram.rootItems;

    if (rootItems.length === 0) {
        return null;
    }

    return (
        <>
            <DragDropContext onDragEnd={doSort}>
                <Droppable droppableId='droppable'>
                    {(provided) => (
                        <div className='pages-list' {...provided.droppableProps} ref={provided.innerRef}>
                            {rootItems.map((item, index) =>
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}>
                                            <OutlineItem
                                                diagram={diagram}
                                                diagramItem={item}
                                                isFirst={index === 0}
                                                isLast={index === rootItems.length - 1}
                                                level={0}
                                                onAction={doAction}
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
