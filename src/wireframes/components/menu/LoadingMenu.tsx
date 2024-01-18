/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { GithubOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { MenuProps } from 'antd/lib';
import * as React from 'react';
import { MarkerButton, Title, useEventCallback } from '@app/core';
import text from '@app/legal.html?raw';
import { texts } from '@app/texts';
import { useStore } from '@app/wireframes/model';
import { ActionDropdownButton, ActionMenuButton, buildMenuItem, useLoading } from './../actions';

export const LoadingMenu = React.memo(() => {
    const forLoading = useLoading();
    const editor = useStore(s => s.editor);
    const tokenToRead = useStore(s => s.loading.tokenToRead);
    const tokenToWrite = useStore(s => s.loading.tokenToWrite);
    const saveTimer = React.useRef<any>();
    const saveAction = React.useRef(forLoading.saveDiagram);
    const [isOpen, setIsOpen] = React.useState(false);

    saveAction.current = forLoading.saveDiagram;

    const doToggleInfoDialog = useEventCallback(() => {
        setIsOpen(x => !x);
    });

    React.useEffect(() => {
        function clearTimer() {
            if (saveTimer.current) {
                clearInterval(saveTimer.current);
                saveTimer.current = null;
            }
        }

        if (tokenToWrite) {
            if (!saveTimer.current) {
                saveTimer.current = setInterval(() => {
                    if (!saveAction.current.disabled) {
                        saveAction.current.onAction();
                    }
                }, 30000);
            }

            const stopTimer = setTimeout(() => {
                clearTimer();
            }, 40000);

            return () => {
                clearTimeout(stopTimer);
            };
        } else {
            clearTimer();

            return undefined;
        }
    }, [tokenToWrite, editor]);

    const saveMenuItems: MenuProps['items'] = [
        buildMenuItem(forLoading.saveDiagramToFile, 'save'),
    ];

    return (
        <>
            <CustomTitle token={tokenToRead} />

            <ActionMenuButton displayMode='IconLabel' action={forLoading.newDiagram} />
            <ActionMenuButton displayMode='Icon' action={forLoading.openDiagramAction} />

            <ActionDropdownButton className='menu-dropdown' displayMode='IconLabel' action={forLoading.saveDiagram} type='primary' menu={{ items: saveMenuItems }} />

            <Button className='menu-item' onClick={doToggleInfoDialog}
                icon={<QuestionCircleOutlined />} />

            <Button className='menu-item' href='https://github.com/mydraft-cc/ui' target='_blank'
                icon={<GithubOutlined />} />

            <MarkerButton />

            <Modal title={texts.common.about} open={isOpen} onCancel={doToggleInfoDialog} onOk={doToggleInfoDialog}>
                <div dangerouslySetInnerHTML={{ __html: text }} />
            </Modal>
        </>
    );
});

const CustomTitle = React.memo(({ token }: { token?: string | null }) => {
    const title = token && token.length > 0 ?
        `mydraft.cc - Diagram ${token}` :
        `mydraft.cc - Diagram ${texts.common.unsaved}`;

    return (
        <Title text={title} />
    );
});
