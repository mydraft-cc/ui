/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { CheckOutlined, DeleteOutlined, FileMarkdownOutlined, FileOutlined } from '@ant-design/icons';
import { Col, Dropdown, Input, InputRef, Row } from 'antd';
import { MenuProps } from 'antd/lib';
import classNames from 'classnames';
import * as React from 'react';
import { Keys, useEventCallback } from '@app/core';
import { texts } from '@app/texts';
import { Diagram, getPageName } from '@app/wireframes/model';

export type PageAction = 'Delete' | 'Rename' | 'SetMaster' | 'Select' | 'Duplicate';

export interface PageProps {
    // The page index.
    index: number;

    // The diagram.
    diagram: Diagram;

    // All diagrams.
    diagrams: ReadonlyArray<Diagram>;

    // True if selected.
    selected?: boolean;

    // When an action should be executed.
    onAction: (diagramId: string, action: PageAction, arg?: any) => void;
}

export const Page = (props: PageProps) => {
    const {
        diagram,
        diagrams,
        index,
        onAction,
        selected,
    } = props;

    const [isOpen, setIsOpen] = React.useState(false);
    const [editName, setEditName] = React.useState('');
    const [editing, setEditing] = React.useState(false);

    const pageMaster = React.useMemo(() => {
        return diagrams.find(x => x.id === diagram.master)?.id;
    }, [diagrams, diagram.master]);

    const pageName = React.useMemo(() => {
        return getPageName(diagram, index);
    }, [diagram, index]);

    const setText = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setEditName(event.target.value);
    });

    const doRenameStart = useEventCallback(() => {
        setEditName(pageName);
        setEditing(true);
    });

    const doRenameCancel = useEventCallback(() => {
        setEditing(false);
    });

    const doDelete = useEventCallback(() => {
        onAction(diagram.id, 'Delete');
    });

    const doDuplicate = useEventCallback(() => {
        onAction(diagram.id, 'Duplicate');
    });

    const doSelect = useEventCallback(() => {
        onAction(diagram.id, 'Select');
    });

    const doSetMaster = useEventCallback((master: string | undefined) => {
        onAction(diagram.id, 'SetMaster', master);
    });

    const doEnter = useEventCallback((event: React.KeyboardEvent) => {
        if (Keys.isEnter(event) || Keys.isEscape(event)) {
            setEditing(false);
        }

        if (Keys.isEnter(event)) {
            onAction(diagram.id, 'Rename', editName);
        }
    });

    const initInput = React.useCallback((event: InputRef) => {
        event?.focus();
    }, []);

    const contextMenu: MenuProps =
        isOpen ? {
            mode: 'vertical',
            items: [
                {
                    key: 'delete',
                    onClick: doDelete,
                    icon: <DeleteOutlined />,
                    label: texts.common.delete,
                },
                {
                    key: 'duplicate',
                    onClick: doDuplicate,
                    label: texts.common.duplicate,
                },
                {
                    key: 'rename',
                    onClick: doRenameStart,
                    label: texts.common.rename,
                },
                {
                    key: 'master',
                    label: texts.common.masterPage,
                    children: [
                        {
                            key: 'noMaster',
                            onClick: () => doSetMaster(undefined),
                            icon: !diagram.master ? <CheckOutlined /> : null,
                            label: texts.common.none,
                        },
                        ...diagrams.map((d, index) => ({
                            key: `master${d.id}`,
                            onClick: () => doSetMaster(d.id),
                            icon: diagram.master === d.id ? <CheckOutlined /> : null,
                            label: getPageName(d, index),
                        })),
                    ],
                },
            ],
        } : DEFAULT_MENU;

    return (
        <div className='tree-item'>
            <div className='tree-item-header-container'>
                {editing ? (
                    <Input value={editName} onChange={setText} onBlur={doRenameCancel} onKeyUp={doEnter} ref={initInput} />
                ) : (
                    <Dropdown menu={contextMenu} trigger={['contextMenu']} onOpenChange={setIsOpen}>
                        <Row className={classNames('tree-item-header', { selected })} wrap={false} onDoubleClick={doRenameStart} onClick={doSelect}>
                            <Col flex='none'>
                                {pageMaster ? (
                                    <FileMarkdownOutlined />
                                ) : (
                                    <FileOutlined />
                                )}
                            </Col>
                            <Col flex='auto' className='tree-item-title no-select'>
                                {pageName}
                            </Col>
                        </Row>
                    </Dropdown>
                )}
            </div>
        </div>
    );
};

const DEFAULT_MENU: MenuProps = { items: [], mode: 'vertical' };