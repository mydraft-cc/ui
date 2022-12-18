/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { CaretDownOutlined, CaretRightOutlined, DeleteOutlined, FileOutlined } from '@ant-design/icons';
import { Col, Dropdown, Input, Menu, Row } from 'antd';
import classNames from 'classnames';
import * as React from 'react';
import { Keys, useEventCallback } from '@app/core';
import { texts } from '@app/texts';
import { Diagram, DiagramItem } from '@app/wireframes/model';

export interface OutlineItemProps {
    // The item.
    diagramItem: DiagramItem;

    // The diagram.
    diagram: Diagram;

    // The level.
    level: number;

    // Invoked when the will will be renamed.
    onRename: (itemId: string, title: string) => void;

    // Invoked when the will will be deleted.
    onDelete: (itemId: string) => void;

    // Invoked when the item will be selected.
    onSelect: (itemId: string) => void;
}

export const OutlineItem = (props: OutlineItemProps) => {
    const {
        diagram,
        diagramItem,
        level,
        onDelete,
        onRename,
        onSelect,
    } = props;

    const [editName, setEditName] = React.useState('');
    const [editing, setEditing] = React.useState(false);
    const [expanded, setExpanded] = React.useState(true);
    const isGroup = diagramItem.type === 'Group';
    const itemName = diagramItem.name || (isGroup ? texts.common.group : diagramItem.renderer);

    const setText = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setEditName(event.target.value);
    });

    const doRename = useEventCallback(() => {
        setEditName(itemName);
        setEditing(true);
    });

    const doRenameEnd = useEventCallback(() => {
        setEditing(false);
    });

    const doDelete = useEventCallback(() => {
        onDelete(diagramItem.id);
    });

    const doSelect = useEventCallback(() => {
        onSelect(diagramItem.id);
    });

    const initInput = React.useCallback((event: Input) => {
        event?.focus();
    }, []);

    const doEnter = useEventCallback((event: React.KeyboardEvent) => {
        if (Keys.isEnter(event)) {
            setEditing(false);

            onRename(diagramItem.id, editName);
        }
    });

    const selected = diagram.selectedIds.has(diagramItem.id);

    return (
        <div className='tree-item'>
            <div className='tree-item-header-container'>
                {editing ? (
                    <Input value={editName} onChange={setText} onBlur={doRenameEnd} onKeyUp={doEnter} ref={initInput} />
                ) : (
                    <Dropdown overlay={
                        <Menu selectable={false}>
                            <Menu.Item key='delete' icon={<DeleteOutlined />} onClick={doDelete}>
                                {texts.common.delete}
                            </Menu.Item>

                            <Menu.Item key='rename' onClick={doRename}>
                                {texts.common.rename}
                            </Menu.Item>
                        </Menu>
                    } trigger={['contextMenu']}>
                        <Row className={classNames('tree-item-header', { selected })} wrap={false} style={{ marginLeft: level * 20 }} onDoubleClick={doRename} onClick={doSelect}>
                            <Col flex='none'>
                                {isGroup ? (
                                    <span onClick={() => setExpanded(x => !x)}>
                                        {expanded ? (
                                            <CaretDownOutlined />
                                        ) : (
                                            <CaretRightOutlined />
                                        )}
                                    </span>
                                ) : (
                                    <FileOutlined />
                                )}
                            </Col>
                            <Col flex='auto' className='tree-item-title no-select'>
                                {itemName}
                            </Col>
                        </Row>
                    </Dropdown>
                )}
            </div>

            {expanded && isGroup && 
                <div>
                    {diagram.children(diagramItem).map(item =>
                        <OutlineItem key={item.id}
                            diagram={diagram}
                            diagramItem={item}
                            level={level + 1}
                            onDelete={onDelete}
                            onRename={onRename}
                            onSelect={onSelect}
                        />,
                    )}
                </div>
            }
        </div>
    );
};