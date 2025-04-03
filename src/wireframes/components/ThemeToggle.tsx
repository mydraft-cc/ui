import { MoonOutlined, SunOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps, Tooltip } from 'antd';
import * as React from 'react';
import { useEventCallback } from '@app/core';
import { setThemeMode } from '../model/actions';
import { useAppDispatch, useAppSelector } from '../../store';
import { texts } from '../../texts';
import { selectEffectiveAppTheme } from '../model/selectors/themeSelectors';
import { AppTheme } from '@app/wireframes/interface';

export const ThemeToggle = () => {
    const dispatch = useAppDispatch();
    const effectiveAppTheme = useAppSelector(selectEffectiveAppTheme);
    const isDarkMode = effectiveAppTheme === 'dark';
    const [tooltipVisible, setTooltipVisible] = React.useState(false);
    
    const handleSetTheme = useEventCallback((mode: AppTheme) => {
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
        switch (effectiveAppTheme) {
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
            menu={{ items, selectedKeys: [effectiveAppTheme] }} 
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