/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DeleteOutlined, FileOutlined } from '@ant-design/icons';
import { texts } from '@app/texts';
import { Diagram } from '@app/wireframes/model';
import { Button, Col, Input, Popconfirm, Row } from 'antd';
import * as React from 'react';

export interface PageProps {
    // The diagram.
    diagram: Diagram;

    // True if selected.
    selected?: boolean;

    // Invoked when the diagram will be renamed.
    onRename: (diagram: Diagram, title: string) => void;

    // Invoked when the diagram will be deleted.
    onDelete: (diagram: Diagram) => void;

    // Invoked when the diagram will be selected.
    onSelect: (diagram: Diagram) => void;
}

export const Page = (props: PageProps) => {
    const {
        diagram,
        onDelete,
        onRename,
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
        onDelete(diagram);
    }, [diagram, onDelete]);

    const doSelect = React.useCallback(() => {
        onSelect(diagram);
    }, [diagram, onSelect]);

    const initInput = React.useCallback((event: Input) => {
        event?.focus();
    }, []);

    const doEnter = React.useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            setEditing(false);

            onRename(diagram, currentText.current);
        }
    }, [diagram, onRename]);

    let clazz = 'page';

    if (selected) {
        clazz += ' selected';
    }

    return (
        <>
            {editing ? (
                <Input value={editText} onChange={setText} onBlur={doEnd} onKeyUp={doEnter} ref={initInput} />
            ) : (
                <Row className={clazz} wrap={false} onDoubleClick={doStart} onClick={doSelect}>
                    <Col flex='none'>
                        <FileOutlined />
                    </Col>
                    <Col flex='auto' className='page-title no-select'>
                        {editText}
                    </Col>
                    <Col flex='none'>
                        <Popconfirm title={texts.common.deleteDiagramConfirm} onConfirm={doDelete}>
                            <Button size='small' type='text'>
                                <DeleteOutlined />
                            </Button>
                        </Popconfirm>
                    </Col>
                </Row>
            )}
        </>
    );
};
