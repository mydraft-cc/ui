/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row } from 'antd';
import * as React from 'react';
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd';
import { useEventCallback } from '@app/core';
import { useAppDispatch } from '@app/store';
import { texts } from '@app/texts';
import { addDiagram, duplicateDiagram, filterDiagrams, getDiagramId, getDiagramsFilter, getFilteredDiagrams, moveDiagram, removeDiagram, renameDiagram, selectDiagram, setDiagramMaster, useStore } from '@app/wireframes/model';
import { Page, PageAction } from './Page';
import './Pages.scss';

export const Pages = () => {
    const dispatch = useAppDispatch();
    const diagramId = useStore(getDiagramId);
    const diagrams = useStore(getFilteredDiagrams);
    const diagramsFilter = useStore(getDiagramsFilter);
    const diagramsOrdered = useStore(x => x.editor.present.orderedDiagrams);

    const doAddDiagram = useEventCallback(() => {
        dispatch(addDiagram());
    });

    const doAction = useEventCallback((diagramId: string, action: PageAction, arg?: any) => {
        switch (action) {
            case 'Delete':
                dispatch(removeDiagram(diagramId));
                break;
            case 'Duplicate':
                dispatch(duplicateDiagram(diagramId));
                break;
            case 'SetMaster':
                dispatch(setDiagramMaster(diagramId, arg));
                break;
            case 'Rename':
                dispatch(renameDiagram(diagramId, arg));
                break;
            case 'Select':
                dispatch(selectDiagram(diagramId));
                break;

        }
    });

    const doFilterShapes = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(filterDiagrams(event.target.value));
    });

    const doSort = useEventCallback((result: DropResult) => {
        dispatch(moveDiagram(result.draggableId, result.destination!.index));
    });

    return (
        <>
            <Row className='pages-search' wrap={false}>
                <Col flex='auto'>
                    <Input value={diagramsFilter} onChange={doFilterShapes}
                        placeholder={texts.common.findPage}
                        prefix={
                            <SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />
                        } />
                </Col>
                <Col flex='none'>
                    <Button type='primary' onClick={doAddDiagram}>
                        <PlusOutlined />
                    </Button>
                </Col>
            </Row>

            <DragDropContext onDragEnd={doSort}>
                <Droppable droppableId='droppable'>
                    {(provided) => (
                        <div className='pages-list' {...provided.droppableProps} ref={provided.innerRef}>
                            {diagrams.map((item, index) =>
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}>
                                            <Page
                                                diagram={item}
                                                diagrams={diagramsOrdered}
                                                index={index}
                                                onAction={doAction}
                                                selected={item.id === diagramId}
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
