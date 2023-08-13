/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { CheckOutlined, DeleteOutlined, FileMarkdownOutlined, FileOutlined } from '@ant-design/icons';
import { Col, Dropdown, Input, Menu, Row } from 'antd';
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

    const initInput = React.useCallback((event: Input) => {
        event?.focus();
    }, []);

    return (
        <div className='tree-item'>
            <div className='tree-item-header-container'>
                {editing ? (
                    <Input value={editName} onChange={setText} onBlur={doRenameCancel} onKeyUp={doEnter} ref={initInput} />
                ) : (
                    <Dropdown overlay={
                        <Menu selectable={false}>
                            <Menu.Item key='delete' icon={<DeleteOutlined />} onClick={doDelete}>
                                {texts.common.delete}
                            </Menu.Item>

                            <Menu.Item key='duplicate' onClick={doDuplicate}>
                                {texts.common.duplicate}
                            </Menu.Item>

                            <Menu.Item key='rename' onClick={doRenameStart}>
                                {texts.common.rename}
                            </Menu.Item>

                            <Menu.SubMenu title={texts.common.masterPage}>
                                <MasterPage
                                    id={undefined}
                                    title={texts.common.none}
                                    diagramId={diagram.id}
                                    diagramMaster={pageMaster}
                                    hide={false}
                                    onSetMaster={doSetMaster}
                                />

                                {diagrams.map((item, index) =>
                                    <MasterPage key={item.id}
                                        id={item.id}
                                        title={getPageName(item, index)}
                                        diagramId={diagram.id}
                                        diagramMaster={pageMaster}
                                        hide={item.id === diagram.id}
                                        onSetMaster={doSetMaster}
                                    />,
                                )}
                            </Menu.SubMenu>
                        </Menu>
                    } trigger={['contextMenu']}>
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

const MasterPage = (props: {
    title: string;
    id: string | undefined;
    diagramId: string;
    diagramMaster: string | undefined;
    hide: boolean;
    onSetMaster: (master: string | undefined) => void;
}) => {
    const {
        id,
        diagramMaster,
        hide,
        onSetMaster,
        title,
    } = props;

    if (hide) {
        return null;
    }

    const selected = id === diagramMaster;

    return (
        <Menu.Item key={id} icon={selected ? <CheckOutlined /> : null} onClick={() => onSetMaster(id)}>
            {title}
        </Menu.Item>
    );
};
