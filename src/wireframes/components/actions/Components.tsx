/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Shortcut, Types } from '@app/core';
import { Button, Menu, Tooltip } from 'antd';
import { ButtonType } from 'antd/lib/button';
import * as React from 'react';
import { UIAction } from './shared';

type ActionProps = { action: UIAction; showLabel?: boolean; type?: ButtonType; hideWhenDisabled?: boolean };

export const ActionMenuButton = React.memo((props: ActionProps) => {
    const {
        disabled,
        label,
        onAction,
        icon,
        shortcut,
        tooltip,
    } = props.action;

    if (disabled && props.hideWhenDisabled) {
        return null;
    }

    const title = shortcut ? `${tooltip} (${shortcut})` : tooltip;

    return (
        <>
            <Tooltip mouseEnterDelay={1} title={title}>
                <Button type={props.type} className={!props.type ? 'menu-item' : undefined} size='large' disabled={disabled} onClick={onAction}>
                    {Types.isString(icon) ? (
                        <i className={icon} />
                    ) : icon}

                    {props.showLabel &&
                        <>&nbsp;{label}</>
                    }
                </Button>
            </Tooltip>

            {shortcut &&
                <Shortcut disabled={disabled} onPressed={onAction} keys={shortcut} />
            }
        </>
    );
});

export const ActionButton = React.memo((props: ActionProps) => {
    const {
        disabled,
        label,
        onAction,
        icon,
        shortcut,
        tooltip,
    } = props.action;

    if (disabled && props.hideWhenDisabled) {
        return null;
    }

    const title = shortcut ? `${tooltip} (${shortcut})` : tooltip;

    return (
        <>
            <Tooltip mouseEnterDelay={1} title={title}>
                <Button disabled={disabled} onClick={onAction}>
                    {Types.isString(icon) ? (
                        <i className={icon} />
                    ) : icon}

                    {props.showLabel &&
                        <>&nbsp;{label}</>
                    }
                </Button>
            </Tooltip>
        </>
    );
});

export const ActionMenuItem = React.memo((props: ActionProps) => {
    const {
        disabled,
        label,
        onAction,
        icon,
    } = props.action;

    if (disabled && props.hideWhenDisabled) {
        return null;
    }

    return (
        <Menu.Item key={label} className='force-color' disabled={disabled} onClick={onAction}
            icon={
                <>
                    {Types.isString(icon) ? (
                        <span className='anticon'>
                            <i className={icon} />
                        </span>
                    ) : icon}
                </>
            }>
            {label}
        </Menu.Item>
    );
});
