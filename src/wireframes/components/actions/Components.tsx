/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { Shortcut, Types } from '@app/core';
import { Button, Menu, Tooltip } from 'antd';
import * as React from 'react';
import { UIAction } from './shared';

export const ActionMenuButton = React.memo((props: { action: UIAction }) => {
    const {
        disabled,
        onAction,
        icon,
        shortcut,
        tooltip,
    } = props.action;

    const title = shortcut ? `${tooltip} (${shortcut})` : tooltip;

    return (
        <>
            <Tooltip mouseEnterDelay={1} title={title}>
                <Button className='menu-item' size='large' disabled={disabled} onClick={onAction}>
                    {Types.isString(icon) ? (
                        <i className={icon} />
                    ) : icon}
                </Button>
            </Tooltip>

            {shortcut &&
                <Shortcut disabled={disabled} onPressed={onAction} keys={shortcut} />
            }
        </>
    );
});

export const ActionButton = React.memo((props: { action: UIAction }) => {
    const {
        disabled,
        onAction,
        icon,
        shortcut,
        tooltip,
    } = props.action;

    const title = shortcut ? `${tooltip} (${shortcut})` : tooltip;

    return (
        <>
            <Tooltip mouseEnterDelay={1} title={title}>
                <Button disabled={disabled} onClick={onAction}>
                    {Types.isString(icon) ? (
                        <i className={icon} />
                    ) : icon}
                </Button>
            </Tooltip>
        </>
    );
});

export const ActionMenuItem = React.memo((props: { action: UIAction }) => {
    const {
        disabled,
        label,
        onAction,
        icon,
    } = props.action;

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
