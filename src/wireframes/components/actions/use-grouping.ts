/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { MathHelper } from '@app/core';
import { texts } from '@app/texts';
import { getDiagramId, getSelectedGroups, getSelectedItems, groupItems, ungroupItems, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

export function useGrouping() {
    const dispatch = useDispatch();
    const selectedDiagramId = useStore(getDiagramId);
    const selectedDiagramIdRef = React.useRef(selectedDiagramId);
    const selectedGroups = useStore(getSelectedGroups);
    const selectedGroupsRef = React.useRef(selectedGroups);
    const selectedItems = useStore(getSelectedItems);
    const selectedItemsRef =  React.useRef(selectedItems);
    const canGroup = selectedItems.length > 1;
    const canUngroup = selectedGroups.length > 0;

    selectedDiagramIdRef.current = selectedDiagramId;
    selectedGroupsRef.current = selectedGroups;
    selectedItemsRef.current = selectedItems;

    const doGroup = React.useCallback(() => {
        if (selectedDiagramIdRef.current) {
            dispatch(groupItems(selectedDiagramIdRef.current, selectedItemsRef.current, MathHelper.guid()));
        }
    }, [dispatch]);

    const doUngroup = React.useCallback(() => {
        if (selectedDiagramIdRef.current) {
            dispatch(ungroupItems(selectedDiagramIdRef.current, selectedGroupsRef.current));
        }
    }, [dispatch]);

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
