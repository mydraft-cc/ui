/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { BugOutlined, GithubOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu, Modal } from 'antd';
import * as React from 'react';
import { Title, useEventCallback, useMarker } from '@app/core';
import text from '@app/legal.html?raw';
import { texts } from '@app/texts';
import { useStore } from '@app/wireframes/model';
import { ActionDropdownButton, ActionMenuButton, ActionMenuItem, UIAction, useLoading } from './../actions';

export const LoadingMenu = React.memo(() => {
    const forLoading = useLoading();
    const editor = useStore(s => s.editor);
    const tokenToRead = useStore(s => s.loading.tokenToRead);
    const tokenToWrite = useStore(s => s.loading.tokenToWrite);
    const marker = useMarker();
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

    return (
        <>
            <CustomTitle token={tokenToRead} />

            <ActionMenuButton displayMode='IconLabel' action={forLoading.newDiagram} />
            <ActionMenuButton displayMode='IconOnly' action={forLoading.openDiagramAction} />

            <ActionDropdownButton displayMode='IconLabel' action={forLoading.saveDiagram} type='primary' overlay={<SaveMenu action={forLoading.saveDiagramToFile} />} />

            <Dropdown overlay={<HelpMenu onToggle={doToggleInfoDialog} onMarker={marker.open} />}>
                <Button className='menu-item' size='large'>
                    <QuestionCircleOutlined />
                </Button>
            </Dropdown>
    
            <Modal title={texts.common.about} visible={isOpen} onCancel={doToggleInfoDialog} onOk={doToggleInfoDialog}>
                <div dangerouslySetInnerHTML={{ __html: text }} />
            </Modal>
        </>
    );
});

const SaveMenu = ({ action }: { action: UIAction }) => {
    return (
        <Menu>
            <ActionMenuItem displayMode='Label' action={action} />
        </Menu>
    );
};

const HelpMenu = ({ onMarker, onToggle }: { onToggle: () => void; onMarker: () => void }) => {
    const openGithub = () => {
        window.open('https://github.com/mydraft-cc/ui', '_target');
    };

    return (
        <Menu>
            <Menu.Item key='about' icon={<QuestionCircleOutlined />} 
                title={texts.common.about} onClick={onToggle}>
                {texts.common.about}
            </Menu.Item>

            <Menu.Item key='github' icon={<GithubOutlined />}
                title={texts.common.github} onClick={openGithub}>
                {texts.common.github}
            </Menu.Item>

            <Menu.Item key='bug' icon={<BugOutlined />}
                title={texts.common.bug} onClick={onMarker}>
                {texts.common.bug}
            </Menu.Item>
        </Menu>
    );
};

const CustomTitle = React.memo(({ token }: { token?: string | null }) => {
    const title = token && token.length > 0 ?
        `mydraft.cc - Diagram ${token}` :
        `mydraft.cc - Diagram ${texts.common.unsaved}`;

    return (
        <Title text={title} />
    );
});
