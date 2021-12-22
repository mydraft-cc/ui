/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { QuestionCircleOutlined } from '@ant-design/icons';
import { Title } from '@app/core';
import { texts } from '@app/texts';
import { useStore } from '@app/wireframes/model';
import { Button, Modal } from 'antd';
import * as React from 'react';
import { ActionMenuButton, useLoading } from './../actions';

const text = require('@app/legal.html').default;

export const LoadingMenu = React.memo(() => {
    const forLoading = useLoading();
    const tokenToRead = useStore(s => s.loading.tokenToRead);
    const tokenToWrite = useStore(s => s.loading.tokenToWrite);
    const saveAction = React.useRef(forLoading.saveDiagram);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(() => {
        saveAction.current = forLoading.saveDiagram;
    }, [forLoading.saveDiagram]);

    const doToggleInfoDialog = React.useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen]);

    React.useEffect(() => {
        if (tokenToWrite) {
            const timer = setInterval(() => {
                if (!saveAction.current.disabled) {
                    saveAction.current.onAction();
                }
            }, 30000);

            return () => {
                clearInterval(timer);
            };
        } else {
            return null;
        }
    }, [tokenToWrite]);

    return (
        <>
            <CustomTitle token={tokenToRead} />

            <ActionMenuButton showLabel action={forLoading.newDiagram} />
            <ActionMenuButton showLabel action={forLoading.saveDiagram} type='primary' />

            <Button className='menu-item' size='large' onClick={doToggleInfoDialog}>
                <QuestionCircleOutlined />
            </Button>

            <Modal title={texts.common.about} visible={isOpen} onCancel={doToggleInfoDialog} onOk={doToggleInfoDialog}>
                <div dangerouslySetInnerHTML={{ __html: text.default }} />
            </Modal>
        </>
    );
});

const CustomTitle = React.memo(({ token }: { token?: string }) => {
    const title = token && token.length > 0 ?
        `mydraft.cc - Diagram ${token}` :
        `mydraft.cc - Diagram ${texts.common.unsaved}`;

    return (
        <Title text={title} />
    );
});
