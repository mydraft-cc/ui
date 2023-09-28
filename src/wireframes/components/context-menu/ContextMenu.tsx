/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Menu } from 'antd';
import * as React from 'react';
import { texts } from '@app/texts';
import { ActionMenuItem, useAlignment, useClipboard, useGrouping, useRemove } from './../actions';

export interface ContextMenuProps {
    onClick?: () => void;
}

export const ContextMenu = React.memo((props: ContextMenuProps) => {
    const forAlignment = useAlignment();
    const forClipboard = useClipboard();
    const forGrouping = useGrouping();
    const forRemove = useRemove();

    return (
        <Menu onClick={props.onClick} className='context-menu' selectable={false} activeKey='none'>
            <ActionMenuItem action={forClipboard.cut} />
            <ActionMenuItem action={forClipboard.copy} />
            <ActionMenuItem action={forClipboard.paste} />

            <Menu.Divider />

            <ActionMenuItem action={forRemove.remove} />

            <Menu.Divider />

            <Menu.SubMenu key='alignment' className='force-color' title={texts.common.alignment}>
                <ActionMenuItem action={forAlignment.alignHorizontalLeft} />
                <ActionMenuItem action={forAlignment.alignHorizontalCenter} />
                <ActionMenuItem action={forAlignment.alignHorizontalRight} />

                <ActionMenuItem action={forAlignment.alignVerticalTop} />
                <ActionMenuItem action={forAlignment.alignVerticalCenter} />
                <ActionMenuItem action={forAlignment.alignVerticalBottom} />

                <ActionMenuItem action={forAlignment.distributeHorizontally} />
                <ActionMenuItem action={forAlignment.distributeVertically} />
            </Menu.SubMenu>

            <Menu.SubMenu key='ordering' className='force-color' title={texts.common.ordering}>
                <ActionMenuItem action={forAlignment.bringToFront} />
                <ActionMenuItem action={forAlignment.bringForwards} />
                <ActionMenuItem action={forAlignment.sendBackwards} />
                <ActionMenuItem action={forAlignment.sendToBack} />
            </Menu.SubMenu>

            <ActionMenuItem action={forGrouping.group} />
            <ActionMenuItem action={forGrouping.ungroup} />
        </Menu>
    );
});
