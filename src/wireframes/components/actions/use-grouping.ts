/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper } from '@app/core';
import { texts } from '@app/texts';
import { getDiagram, getSelectedGroups, getSelectedItems, groupItems, ungroupItems, useStore } from '@app/wireframes/model';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { UIAction } from './shared';

export function useGrouping() {
    const dispatch = useDispatch();
    const selectedDiagram = useStore(getDiagram);
    const selectedGroups = useStore(getSelectedGroups);
    const selectedItems = useStore(getSelectedItems);
    const canGroup = selectedItems.length > 1;
    const canUngroup = selectedGroups.length > 0;

    const doGroup = React.useCallback(() => {
        if (selectedDiagram) {
            dispatch(groupItems(selectedDiagram, selectedItems, MathHelper.guid()));
        }
    }, [dispatch, selectedDiagram, selectedItems]);

    const doUngroup = React.useCallback(() => {
        if (selectedDiagram) {
            dispatch(ungroupItems(selectedDiagram, selectedGroups));
        }
    }, [dispatch, selectedDiagram, selectedGroups]);

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
