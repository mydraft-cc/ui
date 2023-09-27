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
import { Diagram, DiagramItem, OrderMode } from '@app/wireframes/model';

export type OutlineItemAction = 'Delete' | 'Rename' | 'Move' | 'Select';

export interface OutlineItemProps {
    // The item.
    diagramItem: DiagramItem;

    // The diagram.
    diagram: Diagram;

    // The level.
    level: number;

    // True, if the item is the first.
    isFirst: boolean;

    // True, if the item is the last.
    isLast: boolean;

    // When an action should be executed.
    onAction: (itemId: string, action: OutlineItemAction, arg?: any) => void;
}

export const OutlineItem = (props: OutlineItemProps) => {
    const {
        diagram,
        diagramItem,
        level,
        isFirst,
        isLast,
        onAction,
    } = props;

    const [editName, setEditName] = React.useState('');
    const [editing, setEditing] = React.useState(false);
    const [expanded, setExpanded] = React.useState(true);
    const isGroup = diagramItem.type === 'Group';
    const itemName = diagramItem.id || (isGroup ? texts.common.group : diagramItem.renderer);

    const setText = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setEditName(event.target.value);
    });

    const doRenameStart = useEventCallback(() => {
        setEditName(itemName);
        setEditing(true);
    });

    const doRenameCancel = useEventCallback(() => {
        setEditing(false);
    });

    const doDelete = useEventCallback(() => {
        onAction(diagramItem.id, 'Delete');
    });

    const doSelect = useEventCallback(() => {
        onAction(diagramItem.id, 'Select');
    });

    const doMove = useEventCallback((event: { key: string }) => {
        onAction(diagramItem.id, 'Move', event.key);
    });

    const doEnter = useEventCallback((event: React.KeyboardEvent) => {
        if (Keys.isEnter(event) || Keys.isEscape(event)) {
            setEditing(false);
        }

        if (Keys.isEnter(event)) {
            onAction(diagramItem.id, 'Rename', editName);
        }
    });

    const initInput = React.useCallback((event: Input) => {
        event?.focus();
    }, []);

    const selected = diagram.selectedIds.has(diagramItem.id);

    return (
        <div className='tree-item'>
            <div className='tree-item-header-container'>
                {editing ? (
                    <Input value={editName} onChange={setText} onBlur={doRenameCancel} onKeyUp={doEnter} ref={initInput} />
                ) : (
                    <Dropdown overlay={
                        <Menu selectable={false}>
                            <Menu.Item key='rename' onClick={doRenameStart}>
                                {texts.common.rename}
                            </Menu.Item>

                            <Menu.Divider />

                            {level === 0 && 
                                <>
                                    <Menu.Item key={OrderMode.BringToFront} onClick={doMove} disabled={isLast}>
                                        {texts.common.bringToFront}
                                    </Menu.Item>
        
                                    <Menu.Item key={OrderMode.BringForwards} onClick={doMove} disabled={isLast}>
                                        {texts.common.bringForwards}
                                    </Menu.Item>
        
                                    <Menu.Item key={OrderMode.SendBackwards} onClick={doMove} disabled={isFirst}>
                                        {texts.common.sendBackwards}
                                    </Menu.Item>
        
                                    <Menu.Item key={OrderMode.SendToBack}onClick={doMove} disabled={isFirst}>
                                        {texts.common.sendToBack}
                                    </Menu.Item>
        
                                    <Menu.Divider />
                                </>
                            }

                            <Menu.Item key='delete' icon={<DeleteOutlined />} onClick={doDelete}>
                                {texts.common.delete}
                            </Menu.Item>
                        </Menu>
                    } trigger={['contextMenu']}>
                        <Row className={classNames('tree-item-header', { selected })} wrap={false} style={{ marginLeft: level * 20 }} onDoubleClick={doRenameStart} onClick={doSelect}>
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
                <>{renderChildren(props)}</>
            }
        </div>
    );
};

function renderChildren(props: OutlineItemProps) {
    const children = props.diagram.children(props.diagramItem);

    if (children.length === 0) {
        return null;
    }

    const newLevel = props.level + 1;

    return (
        <div>
            {children.map((item, index) =>
                <OutlineItem key={item.id}
                    diagram={props.diagram}
                    diagramItem={item}
                    isFirst={index === 0}
                    isLast={index === children.length - 1}
                    level={newLevel}
                    onAction={props.onAction}
                />,
            )}
        </div>
    );
}