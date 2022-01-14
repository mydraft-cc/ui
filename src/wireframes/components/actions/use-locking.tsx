/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { texts } from '@app/texts';
import { getDiagram, getSelectedItemWithLocked, lockItems, unlockItems, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

export function useLocking() {
    const dispatch = useDispatch();
    const selectedDiagram = useStore(getDiagram);
    const selectedItem = useStore(getSelectedItemWithLocked);

    const doToggle = React.useCallback(() => {
        if (selectedDiagram && selectedItem) {
            if (selectedItem.isLocked) {
                dispatch(unlockItems(selectedDiagram, [selectedItem.id]));
            } else {
                dispatch(lockItems(selectedDiagram, [selectedItem.id]));
            }
        }
    }, [dispatch, selectedDiagram, selectedItem]);

    const lock: UIAction = React.useMemo(() => {
        const icon = selectedItem && selectedItem.isLocked ? (
            <LockOutlined />
        ) : (
            <UnlockOutlined />
        );

        return {
            disabled: !selectedItem,
            icon,
            label: texts.common.lock,
            shortcut: 'MOD + L',
            tooltip: texts.common.lockTooltip,
            onAction: doToggle,
        };
    }, [selectedItem, doToggle]);

    return { lock };
}
