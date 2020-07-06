/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { Shortcut } from '@app/core';
import { getDiagram, getSelectedItemWithLocked, lockItems, unlockItems, useStore } from '@app/wireframes/model';
import { Button, Tooltip } from 'antd';
import * as React from 'react';
import { useDispatch } from 'react-redux';

export const LockMenu = React.memo(() => {
    const dispatch = useDispatch();
    const selectedDiagram = useStore(s => getDiagram(s));
    const selectedItem = useStore(s => getSelectedItemWithLocked(s));

    const doToggle = React.useCallback(() => {
        if (selectedDiagram && selectedItem) {
            if (selectedItem.isLocked) {
                dispatch(unlockItems(selectedDiagram, [selectedItem.id]));
            } else {
                dispatch(lockItems(selectedDiagram, [selectedItem.id]));
            }
        }
    }, [selectedDiagram, selectedItem]);

    return <>
        <Shortcut disabled={!selectedItem} onPressed={doToggle} keys='ctl+l' />

        <Tooltip mouseEnterDelay={1} title='Lock or unlock item (CTRL + L)'>
            <Button className='menu-item' size='large'
                disabled={!selectedItem}
                onClick={doToggle}>
                {selectedItem && selectedItem.isLocked ? (
                    <LockOutlined />
                ) : (
                    <UnlockOutlined />
                )}
            </Button>
        </Tooltip>
    </>;
});
