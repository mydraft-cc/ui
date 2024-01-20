/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { useEventCallback } from '@app/core';
import { useAppDispatch } from '@app/store';
import { texts } from '@app/texts';
import { getDiagramId, getSelection, removeItems, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

export function useRemove() {
    const dispatch = useAppDispatch();
    const selectedDiagramId = useStore(getDiagramId);
    const selectionSet = useStore(getSelection);
    const canRemove = selectionSet.selectedItems.length > 0;

    const doRemove = useEventCallback(() => {
        if (selectedDiagramId) {
            dispatch(removeItems(selectedDiagramId, selectionSet.selectedItems));
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
