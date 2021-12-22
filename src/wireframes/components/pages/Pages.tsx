/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { addDiagram, filterDiagrams, getDiagramId, getDiagramsFilter, getFilteredDiagrams, moveDiagram, removeDiagram, renameDiagram, selectDiagram, setDiagramMaster, useStore } from '@app/wireframes/model';
import { Button, Col, Input, Row } from 'antd';
import { texts } from '@app/texts';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Page } from './Page';
import './Pages.scss';

export const Pages = () => {
    const dispatch = useDispatch();
    const diagramId = useStore(getDiagramId);
    const diagrams = useStore(getFilteredDiagrams);
    const diagramsFilter = useStore(getDiagramsFilter);
    const diagramsOrdered = useStore(x => x.editor.present.orderedDiagrams);

    const doAddDiagram = React.useCallback(() => {
        dispatch(addDiagram());
    }, [dispatch]);

    const doRemoveDiagram = React.useCallback((diagramId: string) => {
        dispatch(removeDiagram(diagramId));
    }, [dispatch]);

    const doRenameDiagram = React.useCallback((diagramId: string, title: string) => {
        dispatch(renameDiagram(diagramId, title));
    }, [dispatch]);

    const doSelectDiagram = React.useCallback((diagramId: string) => {
        dispatch(selectDiagram(diagramId));
    }, [dispatch]);

    const doSetMaster = React.useCallback((diagramId: string, master: string) => {
        dispatch(setDiagramMaster(diagramId, master));
    }, [dispatch]);

    const doFilterShapes = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(filterDiagrams({ filter: event.target.value }));
    }, [dispatch]);

    const doSort = React.useCallback((result: DropResult) => {
        dispatch(moveDiagram(result.draggableId, result.destination.index));
    }, [dispatch]);

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
