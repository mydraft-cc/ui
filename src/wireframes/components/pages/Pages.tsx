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
import { useDispatch } from 'react-redux';
import { useEventCallback } from '@app/core';
import { texts } from '@app/texts';
import { addDiagram, filterDiagrams, getDiagramId, getDiagramsFilter, getFilteredDiagrams, moveDiagram, removeDiagram, renameDiagram, selectDiagram, setDiagramMaster, useStore } from '@app/wireframes/model';
import { Page } from './Page';
import './Pages.scss';

export const Pages = () => {
    const dispatch = useDispatch();
    const diagramId = useStore(getDiagramId);
    const diagrams = useStore(getFilteredDiagrams);
    const diagramsFilter = useStore(getDiagramsFilter);
    const diagramsOrdered = useStore(x => x.editor.present.orderedDiagrams);

    const doAddDiagram = useEventCallback(() => {
        dispatch(addDiagram());
    });

    const doRemoveDiagram = useEventCallback((diagramId: string) => {
        dispatch(removeDiagram(diagramId));
    });

    const doRenameDiagram = useEventCallback((diagramId: string, title: string) => {
        dispatch(renameDiagram(diagramId, title));
    });

    const doSelectDiagram = useEventCallback((diagramId: string) => {
        dispatch(selectDiagram(diagramId));
    });

    const doSetMaster = useEventCallback((diagramId: string, master: string | undefined) => {
        dispatch(setDiagramMaster(diagramId, master));
    });

    const doFilterShapes = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(filterDiagrams({ filter: event.target.value }));
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
                                                onDelete={doRemoveDiagram}
                                                onRename={doRenameDiagram}
                                                onSetMaster={doSetMaster}
                                                onSelect={doSelectDiagram}
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
