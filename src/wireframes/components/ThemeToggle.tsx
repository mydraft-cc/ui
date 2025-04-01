import { MoonOutlined, SunOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps, Tooltip } from 'antd';
import * as React from 'react';
import { useEventCallback } from '@app/core';
import { setThemeMode, ThemeMode } from '../model/actions';
import { useAppDispatch, useAppSelector } from '../../store';
import { texts } from '../../texts';
import { selectEffectiveTheme } from '../model/selectors/themeSelectors';

export const ThemeToggle = () => {
    const dispatch = useAppDispatch();
    const effectiveTheme = useAppSelector(selectEffectiveTheme);
    const themeMode = useAppSelector(state => state.theme.mode);
    const isDarkMode = effectiveTheme === 'dark';
    const [tooltipVisible, setTooltipVisible] = React.useState(false);
    
    const handleSetTheme = useEventCallback((mode: ThemeMode) => {
        dispatch(setThemeMode(mode));
    });
    
    // Hide tooltip when dropdown is clicked
    const handleDropdownVisibleChange = (visible: boolean) => {
        if (visible) {
            setTooltipVisible(false);
        }
    };
    
    // Get current icon based on mode and effective theme
    const getCurrentIcon = () => {
        switch (themeMode) {
            case 'light':
                return <SunOutlined />;
            case 'dark':
                return <MoonOutlined />;
            case 'system':
                return isDarkMode ? <MoonOutlined /> : <SunOutlined />;
            default:
                return isDarkMode ? <MoonOutlined /> : <SunOutlined />;
        }
    };
    
    const items: MenuProps['items'] = [
        {
            key: 'light',
            label: texts.common.lightTheme,
            icon: <SunOutlined />,
            onClick: () => handleSetTheme('light'),
        },
        {
            key: 'dark',
            label: texts.common.darkTheme,
            icon: <MoonOutlined />,
            onClick: () => handleSetTheme('dark'),
        },
        {
            key: 'system',
            label: texts.common.systemTheme,
            icon: <SettingOutlined />,
            onClick: () => handleSetTheme('system'),
        },
    ];
    
    return (
        <Dropdown 
            menu={{ items, selectedKeys: [themeMode] }} 
            trigger={['click']} 
            placement="bottomRight"
            onOpenChange={handleDropdownVisibleChange}
        >
            <Tooltip 
                title={texts.common.toggleTheme}
                open={tooltipVisible}
                onOpenChange={setTooltipVisible}
            >
                <Button type="text" icon={getCurrentIcon()} />
            </Tooltip>
        </Dropdown>
    );
}; 