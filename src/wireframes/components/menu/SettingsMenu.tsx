/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ExportOutlined, PrinterOutlined } from '@ant-design/icons';
import { Button, Dropdown } from 'antd';
import { MenuProps } from 'antd/lib';
import * as React from 'react';
import { texts } from '@app/texts';

export interface SettingsMenuProps {
    // The print callback.
    onPrint: () => void;
}

export const SettingsMenu = React.memo((props: SettingsMenuProps) => {
    const { onPrint } = props;

    const exportMenuItems: MenuProps['items'] = [
        {
            key: 'print',
            icon: <PrinterOutlined />,
            label: texts.common.printDiagrams,
            onClick: onPrint,
        },
    ];

    return (
        <>
            <Dropdown menu={{ items: exportMenuItems }} placement='bottomRight'>
                <Button className='menu-item' size='large'>
                    <ExportOutlined />
                </Button>
            </Dropdown>
        </>
    );
});
