/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import Icon from '@ant-design/icons';
import { Button, Dropdown, Menu, MenuItemProps, Tooltip } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import { DropdownButtonProps } from 'antd/lib/dropdown';
import { MenuItemType } from 'antd/lib/menu/hooks/useItems';
import * as React from 'react';
import { isMac, Shortcut, Types } from '@app/core';
import { UIAction } from './shared';

type ActionDisplayMode = 'Icon' | 'IconLabel' | 'Label';

type ActionProps = {
    // The action to show.
    action: UIAction;

    // The display mdoe.
    displayMode?: ActionDisplayMode;
    
    // True to hide the element when disabled.
    hideWhenDisabled?: boolean;
};

export const ActionMenuButton = React.memo((props: ActionProps & ButtonProps) => {
    const { action, displayMode, hideWhenDisabled, type, ...other } = props;
    const {
        disabled,
        label,
        onAction,
        icon,
        shortcut,
        tooltip,
    } = action;

    if (disabled && hideWhenDisabled) {
        return null;
    }

    const actualDisplayMode = displayMode || 'Icon';

    return (
        <>
            <Tooltip mouseEnterDelay={1} title={buildTitle(shortcut, tooltip)}>
                <Button {...other} type={type} className={!type ? 'menu-item' : undefined} disabled={disabled} onClick={onAction} icon={buildIcon(icon, displayMode)}>
                    {(actualDisplayMode === 'Label' || actualDisplayMode === 'IconLabel') &&
                        <>{label}</>
                    }
                </Button>
            </Tooltip>

            {shortcut &&
                <Shortcut disabled={disabled} onPressed={onAction} keys={shortcut} />
            }
        </>
    );
});

export const ActionDropdownButton = React.memo((props: ActionProps & DropdownButtonProps) => {
    const { action, displayMode, hideWhenDisabled, ...other } = props;
    const {
        disabled,
        label,
        onAction,
        icon,
        shortcut,
        tooltip,
    } = action;

    if (disabled && hideWhenDisabled) {
        return null;
    }

    const actualDisplayMode = displayMode || 'IconLabel';

    return (
        <>
            <Dropdown.Button {...other} size='large' disabled={disabled} onClick={onAction} icon={buildIcon(icon, displayMode)}
                buttonsRender={([leftButton, rightButton]) => [
                    <Tooltip mouseEnterDelay={1} title={buildTitle(shortcut, tooltip)}>
                        {leftButton}
                    </Tooltip>,
                    React.cloneElement(rightButton as React.ReactElement<any, string>),
                ]}>
                    
                {(actualDisplayMode === 'Label' || actualDisplayMode === 'IconLabel') &&
                    <>{label}</>
                }
            </Dropdown.Button>

            {shortcut &&
                <Shortcut disabled={disabled} onPressed={onAction} keys={shortcut} />
            }
        </>
    );
});

export const ActionButton = React.memo((props: ActionProps & ButtonProps) => {
    const { action, displayMode, hideWhenDisabled, ...other } = props;
    const {
        disabled,
        label,
        onAction,
        icon,
        shortcut,
        tooltip,
    } = action;

    if (disabled && hideWhenDisabled) {
        return null;
    }

    const actualDisplayMode = displayMode || 'Icon';

    return (
        <>
            <Tooltip mouseEnterDelay={1} title={ buildTitle(shortcut, tooltip)}>
                <Button {...other} disabled={disabled} onClick={onAction} icon={buildIcon(icon, actualDisplayMode)}>
                    {(actualDisplayMode === 'Label' || actualDisplayMode === 'IconLabel') &&
                        <>{label}</>
                    }
                </Button>
            </Tooltip>
        </>
    );
});

export function buildMenuItem(action: UIAction, key: string) {
    const {
        disabled,
        label,
        onAction,
        icon,
    } = action;

    const item: MenuItemType = {
        key,
        disabled,
        label,
        onClick: onAction,
        icon: buildIcon(icon),
    };

    return item;
}

export const ActionMenuItem = React.memo((props: ActionProps & MenuItemProps) => {
    const { action, displayMode, hideWhenDisabled, ...other } = props;
    const {
        disabled,
        label,
        onAction,
        icon,
    } = action;

    if (disabled && hideWhenDisabled) {
        return null;
    }

    const actualDisplayMode = displayMode || 'IconLabel';

    return (
        <Menu.Item {...other} key={label} className='force-color' disabled={disabled} onClick={onAction} icon={buildIcon(icon)}>
            {(actualDisplayMode === 'Label' || actualDisplayMode === 'IconLabel') &&
                <>{label}</>
            }
        </Menu.Item>
    );
});

function buildIcon(icon: string | JSX.Element | undefined, displayMode?: ActionDisplayMode) {
    if (displayMode === 'Label') {
        return null;
    }

    return Types.isString(icon) ? (<Icon component={() => <i className={icon} />} />) : icon;
}

function buildTitle(shortcut: string | undefined, tooltip: string) {
    function getModKey(): string {
        // Mac users expect to use the command key for shortcuts rather than the control key
        return isMac() ? 'COMMAND' : 'CTRL';
    }

    return shortcut ? `${tooltip} (${shortcut.replace('MOD', getModKey())})` : tooltip;
}
