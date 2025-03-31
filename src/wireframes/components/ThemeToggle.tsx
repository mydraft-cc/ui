import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { Button, Dropdown, MenuProps, Tooltip } from 'antd';
import * as React from 'react';
import { useEventCallback } from '@app/core';
import { selectEffectiveTheme, setThemeMode, ThemeMode } from '../model/actions';
import { useAppDispatch, useAppSelector } from '../../store';
import { texts } from '../../texts';

export const ThemeToggle = () => {
    const dispatch = useAppDispatch();
    const effectiveTheme = useAppSelector(selectEffectiveTheme);
    const isDarkMode = effectiveTheme === 'dark';
    
    const handleSetTheme = useEventCallback((mode: ThemeMode) => {
        dispatch(setThemeMode(mode));
    });
    
    const items: MenuProps['items'] = [
        {
            key: 'light',
            label: texts.common.lightTheme,
            onClick: () => handleSetTheme('light'),
        },
        {
            key: 'dark',
            label: texts.common.darkTheme,
            onClick: () => handleSetTheme('dark'),
        },
        {
            key: 'system',
            label: texts.common.systemTheme,
            onClick: () => handleSetTheme('system'),
        },
    ];
    
    return (
        <Dropdown menu={{ items, selectedKeys: [effectiveTheme] }} trigger={['click']} placement="bottomRight">
            <Tooltip title={texts.common.toggleTheme}>
                <Button type="text" icon={isDarkMode ? <BulbFilled /> : <BulbOutlined />} />
            </Tooltip>
        </Dropdown>
    );
}; 