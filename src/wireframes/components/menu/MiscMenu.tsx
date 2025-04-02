import { EllipsisOutlined, GithubOutlined, QuestionCircleOutlined, MoonOutlined, SunOutlined, SettingOutlined, SmileOutlined } from '@ant-design/icons';
import { Button, Dropdown, MenuProps, Modal, Space, Segmented } from 'antd';
import * as React from 'react';
import { useEventCallback, useMarkerSDK } from '@app/core';
import text from '@app/legal.html?raw';
import { texts } from '@app/texts';
import { useAppDispatch, useAppSelector } from '@app/store';
import { setThemeMode } from '../../model/actions';
import './MiscMenu.scss';
import { AppTheme } from '@app/wireframes/interface';

// Component for larger menu icons with consistent styling
const MenuIcon = ({ icon }: { icon: React.ReactNode }) => (
    <span className="menu-large-icon">{icon}</span>
);

export const MiscMenu = React.memo(() => {
    const [isInfoOpen, setIsInfoOpen] = React.useState(false);
    const { captureMarker } = useMarkerSDK();
    const dispatch = useAppDispatch();
    const themeMode = useAppSelector(state => state.theme.mode);

    const handleSetTheme = useEventCallback((mode: string | number) => {
        // Segmented onChange provides string | number, cast to ThemeMode
        dispatch(setThemeMode(mode as AppTheme));
    });

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
            key: 'themeSegment',
            label: (
                <>
                    <div className="theme-segment-title">{texts.common.toggleTheme}</div>
                    <div className="theme-segment-container">
                        <Segmented<AppTheme>
                            options={[
                                { value: 'light',  label: <Space><SunOutlined /> {texts.common.lightTheme}</Space> },
                                { value: 'dark',   label: <Space><MoonOutlined /> {texts.common.darkTheme}</Space> },
                                { value: 'system', label: <Space><SettingOutlined /> {texts.common.systemTheme}</Space> },
                            ]}
                            value={themeMode}
                            onChange={handleSetTheme}
                            block
                            aria-label={texts.common.toggleTheme}
                        />
                    </div>
                </>
            ),
            disabled: true, 
            className: 'menu-item-no-hover',
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
