import { Button, Icon, Tooltip } from 'antd';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Shortcut } from '@app/core';

import {
    getDiagram,
    getSelectedItemWithLocked,
    lockItems,
    unlockItems,
    useStore
} from '@app/wireframes/model';

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

    const icon = selectedItem && selectedItem.isLocked ? 'lock' : 'unlock';

    return (
        <>
            <Shortcut disabled={!selectedItem} onPressed={doToggle} keys='ctl+l' />

            <Tooltip mouseEnterDelay={1} title='Lock or unlock item (CTRL + L)'>
                <Button className='menu-item' size='large'
                    disabled={!selectedItem}
                    onClick={doToggle}>
                    <Icon type={icon} />
                </Button>
            </Tooltip>
        </>
    );
});