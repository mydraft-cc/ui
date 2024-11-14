/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { MenuProps } from 'antd/lib';
import { texts } from '@app/texts';
import { buildMenuItem, useAlignment, useClipboard, useGrouping, useRemove } from './../actions';

export const useContextMenu = (isOpen: boolean) => {
    const forAlignment = useAlignment();
    const forClipboard = useClipboard();
    const forGrouping = useGrouping();
    const forRemove = useRemove();

    if (!isOpen) {
        return DEFAULT_MENU;
    }

    const items: MenuProps['items'] = [
        buildMenuItem(forClipboard.cut, 'clipboardCut'),
        buildMenuItem(forClipboard.copy, 'clipboardCopy'),
        buildMenuItem(forClipboard.paste, 'clipboarPaste'),
        { type: 'divider' },
        buildMenuItem(forRemove.remove, 'remove'),
        {
            label: texts.common.alignment,
            children: [
                buildMenuItem(forAlignment.alignHorizontalLeft, 'alignHorizontalLeft'),
                buildMenuItem(forAlignment.alignHorizontalCenter, 'alignHorizontalCenter'),
                buildMenuItem(forAlignment.alignHorizontalRight, 'alignHorizontalRight'),

                buildMenuItem(forAlignment.alignVerticalTop, 'alignVerticalTop'),
                buildMenuItem(forAlignment.alignVerticalCenter, 'alignVerticalCenter'),
                buildMenuItem(forAlignment.alignVerticalBottom, 'alignVerticalBottom'),

                buildMenuItem(forAlignment.distributeHorizontally, 'distributeHorizontally'),
                buildMenuItem(forAlignment.distributeVertically, 'distributeVertically'),

            ],
            key: 'alignment',
        },
        {
            label: texts.common.ordering,
            children: [
                buildMenuItem(forAlignment.bringToFront, 'bringToFront'),
                buildMenuItem(forAlignment.bringForwards, 'bringForwards'),
                buildMenuItem(forAlignment.sendBackwards, 'sendBackwards'),
                buildMenuItem(forAlignment.sendToBack, 'sendToBack'),
            ],
            key: 'layers',
        },
        buildMenuItem(forGrouping.group, 'group'),
        buildMenuItem(forGrouping.ungroup, 'ungroup'),
    ];

    return { items, mode: 'vertical' } as MenuProps;
};

const DEFAULT_MENU: MenuProps = { items: [], mode: 'vertical' };