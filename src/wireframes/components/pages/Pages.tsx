/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { addDiagram, Diagram, filterDiagrams, getDiagramId, getDiagramsFilter, getFilteredDiagrams, removeDiagram, renameDiagram, selectDiagram, useStore } from '@app/wireframes/model';
import { Button, Col, Input, Row } from 'antd';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { Page } from './Page';
import './Pages.scss';

export const Pages = () => {
    const dispatch = useDispatch();
    const diagramId = useStore(getDiagramId);
    const diagrams = useStore(getFilteredDiagrams);
    const diagramsFilter = useStore(getDiagramsFilter);

    const doAddDiagram = React.useCallback(() => {
        dispatch(addDiagram());
    }, [dispatch]);

    const doRemoveDiagram = React.useCallback((diagram: Diagram) => {
        dispatch(removeDiagram(diagram));
    }, [dispatch]);

    const doRenameDiagram = React.useCallback((diagram: Diagram, title: string) => {
        dispatch(renameDiagram(diagram, title));
    }, [dispatch]);

    const doSelectDiagram = React.useCallback((diagram: Diagram) => {
        dispatch(selectDiagram(diagram));
    }, [dispatch]);

    const doFilterShapes = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(filterDiagrams({ filter: event.target.value }));
    }, [dispatch]);

    return (
        <>
            <Row className='pages-search' wrap={false}>
                <Col flex='auto'>
                    <Input value={diagramsFilter} onChange={doFilterShapes}
                        placeholder='Find shape'
                        prefix={<SearchOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} />
                </Col>
                <Col flex='none'>
                    <Button type='primary' onClick={doAddDiagram}>
                        <PlusOutlined />
                    </Button>
                </Col>
            </Row>

            <div className='pages-list'>
                {diagrams.map(x =>
                    <Page key={x.id}
                        diagram={x}
                        onDelete={doRemoveDiagram}
                        onRename={doRenameDiagram}
                        onSelect={doSelectDiagram}
                        selected={x.id === diagramId}
                    />,
                )}
            </div>
        </>
    );
};
