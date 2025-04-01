/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MenuProps } from 'antd/lib';
import * as React from 'react';
import { Title } from '@app/core';
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

    saveAction.current = forLoading.saveDiagram;

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

            <ActionDropdownButton 
                className='menu-dropdown save-button' 
                displayMode='IconLabel' 
                action={forLoading.saveDiagram} 
                type='primary' 
                menu={{ items: saveMenuItems }}
            />
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
