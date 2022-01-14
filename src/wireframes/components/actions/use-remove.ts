/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { texts } from '@app/texts';
import { getDiagram, getSelectedItems, removeItems, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

export function useRemove() {
    const dispatch = useDispatch();
    const selectedDiagram = useStore(getDiagram);
    const selectedItems = useStore(getSelectedItems);
    const canRemove = selectedItems.length > 0;

    const doRemove = React.useCallback(() => {
        if (selectedDiagram) {
            dispatch(removeItems(selectedDiagram, selectedItems));
        }
    }, [dispatch, selectedDiagram, selectedItems]);

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
