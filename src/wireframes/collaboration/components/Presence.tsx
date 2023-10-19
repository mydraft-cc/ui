/* eslint-disable @typescript-eslint/no-explicit-any */
import { CopyOutlined, ShareAltOutlined } from '@ant-design/icons';
import { Avatar, Button, Dropdown, Input, message } from 'antd';
import * as React from 'react';
import { copyTextToClipboard } from '@app/core';
import { texts } from '@app/texts';
import { useStore } from '@app/wireframes/model';
import { user } from '@app/wireframes/user';
import { usePresence } from './../hooks';

export const Presence = () => {
    const editor = useStore(x => x.editor);
    const editorId = editor.id;
    const presence = usePresence();

    const sortedUsers = React.useMemo(() => {
        const result = Object.values(presence).filter(x => x.id !== user.id);

        result.sort((a, b) => {
            return a.initial.localeCompare(b.initial);
        });

        result.splice(0, 0, user);

        return result;
    }, [presence]);

    return (
        <>
            {sortedUsers.length > 1 &&
                <Avatar.Group maxCount={2}>
                    {sortedUsers.map(user =>
                        <Avatar key={user.id} style={{ backgroundColor: user.color }}>
                            {user.initial}
                        </Avatar>,
                    )}
                </Avatar.Group>
            }

            <Dropdown overlay={<ShareMenu id={editorId} />}>
                <Button className='menu-item' size='large'>
                    <ShareAltOutlined />
                </Button>
            </Dropdown>
        </>
    );
};

export const ShareMenu = ({ id }: { id: string }) => {
    const link = `${window.location.protocol}//${window.location.host}/c:${id}`;

    const doCopy = () => {
        copyTextToClipboard(link);
    
        message.open({ content: texts.common.copied, key: 'clipboard', type: 'info' });
    };

    return (
        <div className='share ant-menu ant-menu-root'>
            {texts.common.shareText}

            <Input.Group compact>
                <Input value={link} />

                <Button onClick={doCopy}>
                    <CopyOutlined />
                </Button>
            </Input.Group>
        </div>
    );
};