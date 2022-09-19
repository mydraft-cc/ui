/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { texts } from '@app/texts';
import { getDiagramId, getSelectedItems, removeItems, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

export function useRemove() {
    const dispatch = useDispatch();
    const selectedDiagramId = useStore(getDiagramId);
    const selectedDiagramIdRef = React.useRef(selectedDiagramId);
    const selectedItems = useStore(getSelectedItems);
    const selectedItemsRef = React.useRef(selectedItems);
    const canRemove = selectedItems.length > 0;

    selectedDiagramIdRef.current = selectedDiagramId;
    selectedItemsRef.current = selectedItems;

    const doRemove = React.useCallback(() => {
        if (selectedDiagramIdRef.current) {
            dispatch(removeItems(selectedDiagramIdRef.current, selectedItemsRef.current));
        }
    }, [dispatch]);

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
