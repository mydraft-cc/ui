/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { MathHelper } from '@app/core';
import { useEventCallback } from '@app/core';
import { useAppDispatch } from '@app/store';
import { texts } from '@app/texts';
import { getDiagramId, getSelectedGroups, getSelectedItems, groupItems, ungroupItems, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

export function useGrouping() {
    const dispatch = useAppDispatch();
    const selectedDiagramId = useStore(getDiagramId);
    const selectedGroups = useStore(getSelectedGroups);
    const selectedItems = useStore(getSelectedItems);
    const canGroup = selectedItems.length > 1;
    const canUngroup = selectedGroups.length > 0;

    const doGroup = useEventCallback(() => {
        if (selectedDiagramId) {
            dispatch(groupItems(selectedDiagramId, selectedItems, MathHelper.nextId()));
        }
    });

    const doUngroup = useEventCallback(() => {
        if (selectedDiagramId) {
            dispatch(ungroupItems(selectedDiagramId, selectedGroups));
        }
    });

    const group: UIAction = React.useMemo(() => ({
        disabled: !canGroup,
        icon: 'icon-group',
        label: texts.common.group,
        shortcut: 'MOD + G',
        tooltip: texts.common.groupTooltip,
        onAction: doGroup,
    }), [canGroup, doGroup]);

    const ungroup: UIAction = React.useMemo(() => ({
        disabled: !canUngroup,
        icon: 'icon-ungroup',
        label: texts.common.ungroup,
        shortcut: 'MOD + SHIFT + G',
        tooltip: texts.common.ungroupTooltip,
        onAction: doUngroup,
    }), [canUngroup, doUngroup]);

    return { group, ungroup };
}
