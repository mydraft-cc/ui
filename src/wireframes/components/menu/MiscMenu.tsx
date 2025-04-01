import { EllipsisOutlined, GithubOutlined, QuestionCircleOutlined, MoonOutlined, SunOutlined, SettingOutlined, SmileOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps, Modal, Space, Segmented, Divider, Tooltip } from 'antd';
import * as React from 'react';
import { MarkerButton, useEventCallback, useMarkerSDK } from '@app/core';
import text from '@app/legal.html?raw';
import { texts } from '@app/texts';
import { ThemeToggle } from '../ThemeToggle';
import { useAppDispatch, useAppSelector } from '@app/store';
import { setThemeMode, ThemeMode } from '../../model/actions';
import { selectEffectiveTheme } from '../../model/selectors/themeSelectors';
import { forceTriggerThemeChange } from '../../shapes/neutral/ThemeShapeUtils';
import './MiscMenu.scss';

// Component for larger menu icons with consistent styling
const MenuIcon = ({ icon }: { icon: React.ReactNode }) => (
    <span className="menu-large-icon">{icon}</span>
);

// A custom segmented toggle for theme selection
const ThemeSegmentedToggle = React.memo(() => {
    const dispatch = useAppDispatch();
    const effectiveTheme = useAppSelector(selectEffectiveTheme);
    const themeMode = useAppSelector(state => state.theme.mode);
    
    const handleSetTheme = useEventCallback((mode: ThemeMode) => {
        dispatch(setThemeMode(mode));
        
        // Force immediate theme update after toggling
        setTimeout(() => {
            forceTriggerThemeChange();
        }, 0);
    });

    return (
        <Segmented
            value={themeMode}
            onChange={(value) => handleSetTheme(value as ThemeMode)}
            block
            className="theme-segmented"
            options={[
                {
                    value: 'light',
                    icon: <SunOutlined />,
                    label: texts.common.lightTheme
                },
                {
                    value: 'dark',
                    icon: <MoonOutlined />,
                    label: texts.common.darkTheme
                },
                {
                    value: 'system',
                    icon: <SettingOutlined />,
                    label: texts.common.systemTheme
                }
            ]}
        />
    );
});

export const MiscMenu = React.memo(() => {
    const [isInfoOpen, setIsInfoOpen] = React.useState(false);
    const { captureMarker } = useMarkerSDK();

    const doToggleInfoDialog = useEventCallback(() => {
        setIsInfoOpen(x => !x);
    });

    // Prepare menu items for the dropdown
    const menuItems: MenuProps['items'] = [
        {
            key: 'about',
            icon: <MenuIcon icon={<QuestionCircleOutlined />} />,
            label: texts.common.about,
            onClick: doToggleInfoDialog,
            className: 'menu-item-with-icon',
        },
        {
            key: 'github',
            icon: <MenuIcon icon={<GithubOutlined />} />,
            label: (
                <a href='https://github.com/mydraft-cc/ui' target='_blank' rel='noopener noreferrer'>
                    GitHub
                </a>
            ),
            className: 'menu-item-with-icon',
        },
        {
            key: 'feedback',
            icon: <MenuIcon icon={<SmileOutlined />} />,
            label: 'Feedback',
            onClick: captureMarker,
            className: 'menu-item-with-icon',
        },
        {
            type: 'divider'
        },
        {
            key: 'theme',
            label: (
                <span onClick={e => e.stopPropagation()} className="dropdown-theme-toggle">
                    <div className="dropdown-section-title">{texts.common.toggleTheme}</div>
                    <ThemeSegmentedToggle />
                </span>
            ),
            onClick: (e) => e.domEvent.stopPropagation(),
        },
    ];

    return (
        <>
            <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
                <Button className='menu-item' icon={<EllipsisOutlined style={{ fontSize: '20px' }} />} />
            </Dropdown>

            <Modal title={texts.common.about} open={isInfoOpen} onCancel={doToggleInfoDialog} onOk={doToggleInfoDialog}>
                <div dangerouslySetInnerHTML={{ __html: text }} />
            </Modal>
        </>
    );
});
