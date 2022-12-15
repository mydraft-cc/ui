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

export interface PageProps {
    // The page index.
    index: number;

    // The diagram.
    diagram: Diagram;

    // All diagrams.
    diagrams: ReadonlyArray<Diagram>;

    // True if selected.
    selected?: boolean;

    // Invoked when the diagram will be renamed.
    onRename: (diagramId: string, title: string) => void;

    // Invoked when the diagram will be deleted.
    onDelete: (diagramId: string) => void;

    // Invoked when the diagram master will be selected.
    onSetMaster: (diagramId: string, master: string | undefined) => void;

    // Invoked when the diagram will be selected.
    onSelect: (diagramId: string) => void;
}

export const Page = (props: PageProps) => {
    const {
        diagram,
        diagrams,
        index,
        onDelete,
        onRename,
        onSetMaster,
        onSelect,
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

    const doRename = useEventCallback(() => {
        setEditName(pageName);
        setEditing(true);
    });

    const doRenameEnd = useEventCallback(() => {
        setEditing(false);
    });

    const doDelete = useEventCallback(() => {
        onDelete(diagram.id);
    });

    const doSelect = useEventCallback(() => {
        onSelect(diagram.id);
    });

    const doSetMaster = useEventCallback((master: string | undefined) => {
        onSetMaster(diagram.id, master);
    });

    const initInput = React.useCallback((event: Input) => {
        event?.focus();
    }, []);

    const doEnter = useEventCallback((event: React.KeyboardEvent) => {
        if (Keys.isEnter(event)) {
            setEditing(false);

            onRename(diagram.id, editName);
        }
    });

    return (
        <div className='page-container'>
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
                    <Row className={classNames('page', { selected })} wrap={false} onDoubleClick={doRename} onClick={doSelect}>
                        <Col flex='none'>
                            {pageMaster ? (
                                <FileMarkdownOutlined />
                            ) : (
                                <FileOutlined />
                            )}
                        </Col>
                        <Col flex='auto' className='page-title no-select'>
                            {pageName}
                        </Col>
                    </Row>
                </Dropdown>
            )}
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
