/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MathHelper, Shortcut } from '@app/core';
import { calculateSelection, getDiagram, getSelectedGroups, getSelectedItems, groupItems, removeItems, selectItems, ungroupItems, useStore } from '@app/wireframes/model';
import { Button, Tooltip } from 'antd';
import * as React from 'react';
import { useDispatch } from 'react-redux';

export const ArrangeMenu = React.memo(() => {
    const dispatch = useDispatch();
    const selectedDiagram = useStore(getDiagram);
    const selectedGroups = useStore(getSelectedGroups);
    const selectedItems = useStore(getSelectedItems);
    const canGroup = selectedItems.length > 1;
    const canRemove = selectedItems.length > 0;
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

    const doRemove = React.useCallback(() => {
        if (selectedDiagram) {
            dispatch(removeItems(selectedDiagram, selectedItems));
        }
    }, [dispatch, selectedDiagram, selectedItems]);

    const doSelectAll = React.useCallback(() => {
        if (selectedDiagram) {
            dispatch(selectItems(selectedDiagram, calculateSelection(selectedDiagram.items.values, selectedDiagram)));
        }
    }, [dispatch, selectedDiagram]);

    return (
        <>
            <Tooltip mouseEnterDelay={1} title='Group items (CTRL + G)'>
                <Button className='menu-item' size='large'
                    disabled={!canGroup}
                    onClick={doGroup}>
                    <i className='icon-group' />
                </Button>
            </Tooltip>

            <Shortcut disabled={!canGroup} onPressed={doGroup} keys='ctrl+g' />

            <Tooltip mouseEnterDelay={1} title='Ungroup items (CTRL + SHIFT + G)'>
                <Button className='menu-item' size='large'
                    disabled={!canUngroup}
                    onClick={doUngroup}>
                    <i className='icon-ungroup' />
                </Button>
            </Tooltip>

            <Shortcut disabled={!canUngroup} onPressed={doUngroup} keys='ctrl+shift+g' />

            <Tooltip mouseEnterDelay={1} title='Delete selected items (DELETE)'>
                <Button className='menu-item' size='large'
                    disabled={!canRemove}
                    onClick={doRemove}>
                    <i className='icon-delete' />
                </Button>
            </Tooltip>

            <Shortcut disabled={!canRemove} onPressed={doRemove} keys='del' />
            <Shortcut disabled={!canRemove} onPressed={doRemove} keys='backspace' />

            <Shortcut disabled={!selectedDiagram} onPressed={doSelectAll} keys='ctrl+a' />
        </>
    );
});
