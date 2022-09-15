/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ExportOutlined, PrinterOutlined } from '@ant-design/icons';
import { Button, Dropdown, Menu } from 'antd';
import MenuItem from 'antd/lib/menu/MenuItem';
import * as React from 'react';
import { texts } from '@app/texts';

export interface SettingsMenuProps {
    // The print callback.
    onPrint: () => void;
}

export const SettingsMenu = React.memo((props: SettingsMenuProps) => {
    const { onPrint } = props;

    const exportMenu =
        <Menu>
            <MenuItem onClick={onPrint}>
                <PrinterOutlined /> {texts.common.printDiagrams}
            </MenuItem>
        </Menu>;

    return (
        <>
            <Dropdown overlay={exportMenu} placement='bottomRight'>
                <Button className='menu-item' size='large'>
                    <ExportOutlined />
                </Button>
            </Dropdown>
        </>
    );
});
