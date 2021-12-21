/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { CheckOutlined, DeleteOutlined, FileMarkdownOutlined, FileOutlined } from '@ant-design/icons';
import { texts } from '@app/texts';
import { Diagram } from '@app/wireframes/model';
import { Col, Dropdown, Input, Menu, Row } from 'antd';
import classNames from 'classnames';
import * as React from 'react';

export interface PageProps {
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
        onDelete,
        onRename,
        onSetMaster,
        onSelect,
        selected,
    } = props;

    const currentText = React.useRef<string>();
    const [editText, setEditText] = React.useState('');
    const [editing, setEditing] = React.useState(false);

    const setTextValue = React.useCallback((text: string) => {
        currentText.current = text || texts.common.page;

        setEditText(currentText.current);
    }, []);

    React.useEffect(() => {
        setTextValue(diagram.title);
    }, [diagram.title, setTextValue]);

    const setText = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setTextValue(event.target.value);
    }, [setTextValue]);

    const doStart = React.useCallback(() => {
        setTextValue(diagram.title);
        setEditing(true);
    }, [diagram.title, setTextValue]);

    const doEnd = React.useCallback(() => {
        setTextValue(diagram.title);
        setEditing(false);
    }, [diagram.title, setTextValue]);

    const doDelete = React.useCallback(() => {
        onDelete(diagram.id);
    }, [diagram.id, onDelete]);

    const doSelect = React.useCallback(() => {
        onSelect(diagram.id);
    }, [diagram.id, onSelect]);

    const doSetMaster = React.useCallback((master: string | undefined) => {
        onSetMaster(diagram.id, master);
    }, [diagram.id, onSetMaster]);

    const master = React.useMemo(() => {
        return diagrams.find(x => x.id === diagram.master)?.id;
    }, [diagrams, diagram.master]);

    const initInput = React.useCallback((event: Input) => {
        event?.focus();
    }, []);

    const doEnter = React.useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            setEditing(false);

            onRename(diagram.id, currentText.current);
        }
    }, [diagram.id, onRename]);

    return (
        <>
            {editing ? (
                <Input value={editText} onChange={setText} onBlur={doEnd} onKeyUp={doEnter} ref={initInput} />
            ) : (
                <Dropdown overlay={
                    <Menu selectable={false}>
                        <Menu.Item key='delete' icon={<DeleteOutlined />} onClick={doDelete}>
                            {texts.common.delete}
                        </Menu.Item>

                        <Menu.SubMenu title={texts.common.masterPage}>
                            <MasterPage
                                id={undefined}
                                title={texts.common.none}
                                diagramId={diagram.id}
                                diagramMaster={master}
                                onSetMaster={doSetMaster} />

                            {diagrams.filter(x => x.id !== diagram.id).map(d =>
                                <MasterPage key={d.id}
                                    id={d.id}
                                    title={d.title || texts.common.page}
                                    diagramId={diagram.id}
                                    diagramMaster={master}
                                    onSetMaster={doSetMaster} />,
                            )}
                        </Menu.SubMenu>
                    </Menu>
                } trigger={['contextMenu']}>
                    <Row className={classNames('page', { selected })} wrap={false} onDoubleClick={doStart} onClick={doSelect}>
                        <Col flex='none'>
                            {master ? (
                                <FileMarkdownOutlined />
                            ) : (
                                <FileOutlined />
                            )}
                        </Col>
                        <Col flex='auto' className='page-title no-select'>
                            {editText}
                        </Col>
                    </Row>
                </Dropdown>
            )}
        </>
    );
};

const MasterPage = (props: {
    title: string;
    id: string | undefined;
    diagramId: string;
    diagramMaster: string | undefined;
    onSetMaster: (master: string | undefined) => void;
}) => {
    const {
        id,
        diagramMaster,
        onSetMaster,
        title,
    } = props;

    const selected = id === diagramMaster;

    return (
        <Menu.Item key={id} icon={selected ? <CheckOutlined /> : null} onClick={() => onSetMaster(id)}>
            {title}
        </Menu.Item>
    );
};
