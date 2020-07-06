/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { SettingOutlined } from '@ant-design/icons';
import { Shortcut } from '@app/core';
import { changeSize, useStore } from '@app/wireframes/model';
import { Button, Col, InputNumber, Modal, Row, Tooltip } from 'antd';
import * as React from 'react';
import { useDispatch } from 'react-redux';

export const SettingsMenu = React.memo(() => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [sizeWidth, setWidth] = React.useState(0);
    const [sizeHeight, setHeight] = React.useState(0);

    const dispatch = useDispatch();

    const size = useStore(x => x.editor.present.size);

    React.useEffect(() => {
        setWidth(size.x);
        setHeight(size.y);
    }, [size]);

    const doChangeSize = React.useCallback(() => {
        dispatch(changeSize(sizeWidth, sizeHeight));

        setIsOpen(false);
    }, [sizeWidth, sizeHeight]);

    const doToggle = React.useCallback(() => {
        setIsOpen(value => !value);
    }, []);

    const doSetWidth = React.useCallback((value: number) => {
        setWidth(value);
    }, []);

    const doSetHeight = React.useCallback((value: number) => {
        setHeight(value);
    }, []);

    return <>
        <Shortcut onPressed={doToggle} keys='ctl+o' />

        <Tooltip mouseEnterDelay={1} title='Show more options (CTRL + O)'>
            <Button className='menu-item' size='large'
                onClick={doToggle}>
                <SettingOutlined />
            </Button>
        </Tooltip>

        <Modal title='Diagram Options'
            visible={isOpen}
            onCancel={doToggle}
            onOk={doChangeSize}
        >
            <Row className='property'>
                <Col span={12} className='property-label'>Width</Col>
                <Col span={12} className='property-value'>
                    <InputNumber value={sizeWidth} min={300} max={3000} onChange={doSetWidth} />
                </Col>
            </Row>

            <Row className='property'>
                <Col span={12} className='property-label'>Height</Col>
                <Col span={12} className='property-value'>
                    <InputNumber value={sizeHeight} min={300} max={3000} onChange={doSetHeight} />
                </Col>
            </Row>
        </Modal>
    </>;
});
