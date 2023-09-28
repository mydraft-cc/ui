/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Button, Dropdown, Menu, MenuItemProps, Tooltip } from 'antd';
import { ButtonProps } from 'antd/lib/button';
import { DropdownButtonProps } from 'antd/lib/dropdown';
import * as React from 'react';
import { isMac, Shortcut, Types } from '@app/core';
import { UIAction } from './shared';

type ActionDisplayMode = 'IconOnly' | 'IconLabel' | 'Label';

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

    const title = buildTitle(shortcut, tooltip);

    return (
        <>
            <Tooltip mouseEnterDelay={1} title={title}>
                <Button {...other} type={type} className={!type ? 'menu-item' : undefined} size='large' disabled={disabled} onClick={onAction}>
                    <ButtonContent icon={icon} label={label} displayMode={displayMode || 'IconOnly'} />
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

    const title = buildTitle(shortcut, tooltip);

    return (
        <>
            <Dropdown.Button {...other} size='large' disabled={disabled} onClick={onAction}
                buttonsRender={([leftButton, rightButton]) => [
                    <Tooltip mouseEnterDelay={1} title={title}>
                        {leftButton}
                    </Tooltip>,
                    React.cloneElement(rightButton as React.ReactElement<any, string>),
                ]}>
                <ButtonContent icon={icon} label={label} displayMode={displayMode || 'IconOnly'} />
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

    const title = buildTitle(shortcut, tooltip);

    return (
        <>
            <Tooltip mouseEnterDelay={1} title={title}>
                <Button {...other} disabled={disabled} onClick={onAction}>
                    <ButtonContent icon={icon} label={label} displayMode={displayMode || 'IconOnly'} />
                </Button>
            </Tooltip>
        </>
    );
});

export const ActionMenuItem = React.memo((props: ActionProps & MenuItemProps) => {
    const { action, displayMode, hideWhenDisabled, ...other } = props;
    const {
        disabled,
        label,
        onAction,
        icon,
    } = action;

    const actualDisplayMode = displayMode || 'IconLabel';

    if (disabled && hideWhenDisabled) {
        return null;
    }

    return (
        <Menu.Item {...other} key={label} className='force-color' disabled={disabled} onClick={onAction}
            icon={(actualDisplayMode === 'IconOnly' || actualDisplayMode === 'IconLabel') ? (
                <>
                    {Types.isString(icon) ? (
                        <span className='anticon'>
                            <i className={icon} />
                        </span>
                    ) : icon}
                </>
            ) : undefined}>

            {(actualDisplayMode === 'Label' || actualDisplayMode === 'IconLabel') &&
                <>{label}</>
            }
        </Menu.Item>
    );
});

const ButtonContent = ({ displayMode, label, icon }: { icon: string | JSX.Element; label: string; displayMode: ActionDisplayMode }) => {
    return (
        <>
            {(displayMode === 'IconOnly' || displayMode === 'IconLabel') &&
                <>
                    {Types.isString(icon) ? (
                        <i className={icon} />
                    ) : icon}
                </>
            }

            {(displayMode === 'Label' || displayMode === 'IconLabel') &&
                <>&nbsp;{label}</>
            }
        </>
    );
};

function buildTitle(shortcut: string | undefined, tooltip: string) {
    function getModKey(): string {
        // Mac users expect to use the command key for shortcuts rather than the control key
        return isMac() ? 'COMMAND' : 'CTRL';
    }

    return shortcut ? `${tooltip} (${shortcut.replace('MOD', getModKey())})` : tooltip;
}
