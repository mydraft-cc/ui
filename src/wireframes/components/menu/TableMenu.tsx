/*
 * mydraft.cc
 *
 * Do Duc Quan
 * 15 Oct 2023
*/

import { InsertRowBelowOutlined, InsertRowRightOutlined, CheckSquareOutlined, TableOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useEventCallback, MathHelper } from '@app/core';
import { Button, Tooltip } from 'antd';
import { getDiagramId, DiagramItem, calculateSelection, getDiagram, groupItems, selectItems, useStore, DiagramItemSet, Serializer, pasteItems, addShape } from '@app/wireframes/model';
import * as React from 'react';

export const TableMenu = React.memo(() => {
    const dispatch = useDispatch();
    const selectedDiagram = useStore(getDiagram);
    const selectedDiagramId = useStore(getDiagramId);
    // const selectedIDs = useStore(getSelectedIds);
    
    const PREFIX = 'my-draft:';
    const OFFSET = 1;
    const onCreation = React.useRef(false);
    const rowContent: React.MutableRefObject<Set<string>> = React.useRef(new Set());
    const colContent: React.MutableRefObject<Set<string>> = React.useRef(new Set());
    const tableContent: React.MutableRefObject<Set<string>> = React.useRef(new Set());
    
    const createTable = useEventCallback(() => {
        const INIT_POSITION = 40;
        if (selectedDiagramId) {
            const newShape = dispatch(addShape(selectedDiagramId, 'Cell', { position: { x: INIT_POSITION, y: INIT_POSITION } }));
            updateRef(newShape.payload.id);
        }

        onCreation.current = true;
    });

    const updateRef = (id: string, mode?: string) => {
        mode = (mode) ? mode : '';
        tableContent.current.add(id);

        if (mode != 'row') {
            colContent.current.add(id);
        }
        if (mode != 'col') {
            rowContent.current.add(id);
        }
    };

    const addColumn = useEventCallback(() => {
        // Select previous column
        var columnItems = new Array<DiagramItem>();
        if (selectedDiagram) {
            selectedDiagram.items.values.forEach((e: DiagramItem) => {
                if (colContent.current.has(e.id)) {
                    columnItems.push(e);
                    colContent.current.delete(e.id);
                }
            })

            const selection = calculateSelection(columnItems, selectedDiagram);
            dispatch(selectItems(selectedDiagram, selection));
        }

        // Copy and paste column
        if (selectedDiagram) {
            const set = DiagramItemSet.createFromDiagram(columnItems, selectedDiagram);

            const text = `${PREFIX}${JSON.stringify(Serializer.serializeSet(set))}` as string;
    
            if (text) {
                const pasteAction = dispatch(pasteItems(selectedDiagram, text.substring(PREFIX.length), OFFSET, 0));
                const newItems = JSON.parse(pasteAction.payload.json)['visuals'];
                for (let i = 0; i < newItems.length; i++) {
                    updateRef(newItems[i].id, (i == newItems.length - 1 || newItems.length == 1) ? '' : 'col');
                }
            }
        }
    });

    const addRow = useEventCallback(() => {
        // Select previous row
        var rowItems = new Array<DiagramItem>();
        if (selectedDiagram) {
            selectedDiagram.items.values.forEach((e: DiagramItem) => {
                if (rowContent.current.has(e.id)) {
                    rowItems.push(e);
                    rowContent.current.delete(e.id);
                }
            })

            const selection = calculateSelection(rowItems, selectedDiagram);
            dispatch(selectItems(selectedDiagram, selection));
        }

        // Copy and paste row
        if (selectedDiagram) {
            const set = DiagramItemSet.createFromDiagram(rowItems, selectedDiagram);

            const text = `${PREFIX}${JSON.stringify(Serializer.serializeSet(set))}` as string;
    
            if (text) {
                const pasteAction = dispatch(pasteItems(selectedDiagram, text.substring(PREFIX.length), 0, OFFSET));
                const newItems = JSON.parse(pasteAction.payload.json)['visuals'];
                for (let i = 0; i < newItems.length; i++) {
                    updateRef(newItems[i].id, (i == newItems.length - 1  || newItems.length == 1) ? '' : 'row');
                }
            }
        }
    });

    const saveTable = useEventCallback(() => {
        var tableItems = new Array<DiagramItem>();
        if (selectedDiagram) {
            selectedDiagram.items.values.forEach((e: DiagramItem) => {
                if (tableContent.current.has(e.id)) {
                    tableItems.push(e);
                }
            })

            const selection = calculateSelection(tableItems, selectedDiagram);
            dispatch(selectItems(selectedDiagram, selection));
        }

        if (selectedDiagramId) {
            dispatch(groupItems(selectedDiagramId, tableItems, MathHelper.nextId()));
        }

        // Restart all refs
        rowContent.current = new Set();
        colContent.current = new Set();
        tableContent.current = new Set();
        onCreation.current = false;
    });

    return (
        <>
            <Tooltip mouseEnterDelay={1} title={ 'Create Table' }>
                <Button size='large' disabled={onCreation.current} className='menu-item' onClick={ createTable }>
                    <TableOutlined />
                </Button>
            </Tooltip>
            <Tooltip mouseEnterDelay={1} title={ 'Add New Column' }>
                <Button size='large' disabled={!onCreation.current} className='menu-item' onClick={ addColumn }>
                    <InsertRowRightOutlined />
                </Button>
            </Tooltip>
            <Tooltip mouseEnterDelay={1} title={ 'Add New Row' }>
                <Button size='large' disabled={!onCreation.current} className='menu-item' onClick={ addRow }>
                    <InsertRowBelowOutlined />
                </Button>
            </Tooltip>
            <Tooltip mouseEnterDelay={1} title={ 'Save Table' }>
                <Button size='large' disabled={!onCreation.current} className='menu-item' onClick={ saveTable }>
                    <CheckSquareOutlined />
                </Button>
            </Tooltip>
        </>
    );
});
