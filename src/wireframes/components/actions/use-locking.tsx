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
import { getDiagramId, getSelectedItemWithLocked, lockItems, unlockItems, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

export function useLocking() {
    const dispatch = useDispatch();
    const selectedDiagramId = useStore(getDiagramId);
    const selectedDiagramIdRef = React.useRef(selectedDiagramId);
    const selectedItem = useStore(getSelectedItemWithLocked);
    const selectedItemRef = React.useRef(selectedItem);

    selectedDiagramIdRef.current = selectedDiagramId;
    selectedItemRef.current = selectedItem;

    const doToggle = React.useCallback(() => {
        if (selectedDiagramIdRef.current && selectedItemRef.current) {
            if (selectedItemRef.current.isLocked) {
                dispatch(unlockItems(selectedDiagramIdRef.current, [selectedItemRef.current.id]));
            } else {
                dispatch(lockItems(selectedDiagramIdRef.current, [selectedItemRef.current.id]));
            }
        }
    }, [dispatch]);

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
