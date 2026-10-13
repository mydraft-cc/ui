/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { CopyOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Avatar, Button, Input, Popover, Space, Tooltip } from 'antd';
import * as React from 'react';
import { useEventCallback } from '@app/core';
import { useAppDispatch } from '@app/store';
import { texts } from '@app/texts';
import { showToast } from '@app/wireframes/model';
import { useCollaboration, usePresence } from './hooks';
import { user } from './user';

export const Presence = React.memo(() => {
    const dispatch = useAppDispatch();
    const collaboration = useCollaboration();
    const others = usePresence();

    const link = collaboration.room ?
        `${window.location.protocol}//${window.location.host}/c:${collaboration.room}` :
        null;

    const doCopy = useEventCallback(async () => {
        if (!link) {
            return;
        }

        try {
            await navigator.clipboard.writeText(link);

            dispatch(showToast(texts.common.collaborateLinkCopied, 'success'));
        } catch (ex) {
            // The user can still copy the link manually from the input.
            console.warn('Failed to copy the collaboration link.', ex);
        }
    });

    const doStart = useEventCallback(() => {
        collaboration.start();
    });

    if (!collaboration.isSupported) {
        return null;
    }

    const content = link ? (
        <div style={{ width: 360 }}>
            <p>{texts.common.collaborateText}</p>

            <Space.Compact style={{ width: '100%' }}>
                <Input value={link} readOnly />

                <Button icon={<CopyOutlined />} onClick={doCopy} />
            </Space.Compact>

            {collaboration.status !== 'Connected' &&
                <p style={{ marginTop: 8 }}>{texts.common.collaborateConnecting}</p>
            }
        </div>
    ) : null;

    return (
        <>
            {others.length > 0 &&
                <Avatar.Group max={{ count: 3 }} size='small' style={{ marginRight: 8 }}>
                    {[user, ...others].map(x =>
                        <Avatar key={x.id} style={{ backgroundColor: x.color }}>
                            {x.initial}
                        </Avatar>,
                    )}
                </Avatar.Group>
            }

            {link ? (
                <Popover content={content} trigger='click' placement='bottomRight'>
                    <Button className='menu-item' size='large' icon={<ShareAltOutlined />}
                        type={collaboration.status === 'Connected' ? 'primary' : 'default'} />
                </Popover>
            ) : (
                <Tooltip title={texts.common.collaborateStart}>
                    <Button className='menu-item' size='large' icon={<ShareAltOutlined />} onClick={doStart} />
                </Tooltip>
            )}
        </>
    );
});
