/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import * as React from 'react';
import { useEventCallback } from '@app/core';
import { useAppDispatch } from '@app/store';
import { texts } from '@app/texts';
import { getDiagramId, getSelectedItemWithLocked, lockItems, unlockItems, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

export function useLocking() {
    const dispatch = useAppDispatch();
    const selectedDiagramId = useStore(getDiagramId);
    const selectedItem = useStore(getSelectedItemWithLocked);

    const doToggle = useEventCallback(() => {
        if (selectedDiagramId && selectedItem) {
            if (selectedItem.isLocked) {
                dispatch(unlockItems(selectedDiagramId, [selectedItem.id]));
            } else {
                dispatch(lockItems(selectedDiagramId, [selectedItem.id]));
            }
        }
    });

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
