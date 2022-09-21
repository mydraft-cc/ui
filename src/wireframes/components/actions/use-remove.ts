/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { useEventCallback } from '@app/core';
import { texts } from '@app/texts';
import { getDiagramId, getSelectedItems, removeItems, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

export function useRemove() {
    const dispatch = useDispatch();
    const selectedDiagramId = useStore(getDiagramId);
    const selectedItems = useStore(getSelectedItems);
    const canRemove = selectedItems.length > 0;

    const doRemove = useEventCallback(() => {
        if (selectedDiagramId) {
            dispatch(removeItems(selectedDiagramId, selectedItems));
        }
    });

    const remove: UIAction = React.useMemo(() => ({
        disabled: !canRemove,
        icon: 'icon-delete',
        label: texts.common.remove,
        shortcut: 'DELETE',
        tooltip: texts.common.removeTooltip,
        onAction: doRemove,
    }), [canRemove, doRemove]);

    return { remove };
}
