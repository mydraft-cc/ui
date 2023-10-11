/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

// import { GithubOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Menu } from 'antd';
import * as React from 'react';
import { Title } from '@app/core';
import { texts } from '@app/texts';
import { useStore } from '@app/wireframes/model';
import { ActionDropdownButton, ActionMenuButton, ActionMenuItem, useLoading } from './../actions';

// const text = require('@app/legal.html');

export const LoadingMenu = React.memo(() => {
    const forLoading = useLoading();
    const editor = useStore(s => s.editor);
    const tokenToRead = useStore(s => s.loading.tokenToRead);
    const tokenToWrite = useStore(s => s.loading.tokenToWrite);
    const saveTimer = React.useRef<any>();
    const saveAction = React.useRef(forLoading.saveDiagram);
    // const [isOpen, setIsOpen] = React.useState(false);

    saveAction.current = forLoading.saveDiagram;

    // const doToggleInfoDialog = useEventCallback(() => {
    //     setIsOpen(x => !x);
    // });

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

    const menu = (
        <Menu >
            <ActionMenuItem displayMode='Label' action={forLoading.saveDiagramToFile} />
        </Menu>
    );

    return (
        <>
            <CustomTitle token={tokenToRead} />

            <ActionMenuButton displayMode='IconLabel' action={forLoading.newDiagram} />
            <ActionMenuButton displayMode='Icon' action={forLoading.openDiagramAction} />

            <ActionDropdownButton displayMode='IconLabel' action={forLoading.saveDiagram} type='primary' overlay={menu} />
{/* 
            <Button className='menu-item' size='large' onClick={doToggleInfoDialog}>
                <QuestionCircleOutlined />
            </Button>

            <Button className='menu-item' size='large' href='https://github.com/mydraft-cc/ui' target='_blank'>
                <GithubOutlined />
            </Button>

            <MarkerButton />

            <Modal title={texts.common.about} visible={isOpen} onCancel={doToggleInfoDialog} onOk={doToggleInfoDialog}>
                <div dangerouslySetInnerHTML={{ __html: text.default }} />
            </Modal> */}
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
