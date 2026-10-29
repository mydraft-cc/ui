/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { DeleteOutlined } from '@ant-design/icons';
import { Avatar, Button, Input, Popconfirm, Space, Typography } from 'antd';
import { formatDistanceToNow } from 'date-fns';
import * as React from 'react';
import { useStore as useReduxStore } from 'react-redux';
import { useEventCallback } from '@app/core';
import { useAppDispatch } from '@app/store';
import { texts } from '@app/texts';
import { EditorStateInStore, restoreDiagram, showToast } from '@app/wireframes/model';
import { useCollaboration, useVersions } from './hooks';
import { user } from './user';
import { addVersion, readVersion, removeVersion, Version } from './versions';
import './VersionList.scss';

export const VersionList = React.memo(() => {
    const dispatch = useAppDispatch();
    const store = useReduxStore<EditorStateInStore>();
    const versions = useVersions();
    const { document } = useCollaboration();
    const [name, setName] = React.useState('');

    const doSave = useEventCallback(() => {
        const trimmed = name.trim();

        if (!document || !trimmed) {
            return;
        }

        addVersion(document, trimmed, store.getState().editor, user);
        setName('');
    });

    const doRestore = useEventCallback((version: Version) => {
        try {
            dispatch(restoreDiagram(readVersion(version)));
            dispatch(showToast(texts.common.versionRestored, 'success'));
        } catch (ex) {
            console.error(`Failed to restore version ${version.id}.`, ex);
            dispatch(showToast(texts.common.loadingDiagramFailed, 'error'));
        }
    });

    const doRemove = useEventCallback((version: Version) => {
        if (document) {
            removeVersion(document, version.id);
        }
    });

    if (!document) {
        return null;
    }

    return (
        <div className='versions'>
            <Typography.Title level={5}>{texts.common.versions}</Typography.Title>

            <Space.Compact style={{ width: '100%' }}>
                <Input value={name} placeholder={texts.common.versionName} onChange={ev => setName(ev.target.value)} onPressEnter={doSave} />

                <Button disabled={!name.trim()} onClick={doSave}>{texts.common.versionSave}</Button>
            </Space.Compact>

            {versions.length === 0 ? (
                <p className='versions-empty'>{texts.common.versionNone}</p>
            ) : (
                <ul className='versions-list'>
                    {[...versions].reverse().map(version =>
                        <li key={version.id}>
                            <Avatar size='small' style={{ backgroundColor: version.author.color }}>
                                {version.author.initial}
                            </Avatar>

                            <div className='versions-info'>
                                <div className='versions-name'>{version.name}</div>
                                <div className='versions-date'>{formatDistanceToNow(version.created, { addSuffix: true })}</div>
                            </div>

                            <Popconfirm title={texts.common.versionRestoreConfirm} onConfirm={() => doRestore(version)}>
                                <Button size='small'>{texts.common.versionRestore}</Button>
                            </Popconfirm>

                            <Popconfirm title={texts.common.versionDeleteConfirm} onConfirm={() => doRemove(version)}>
                                <Button size='small' type='text' icon={<DeleteOutlined />} />
                            </Popconfirm>
                        </li>,
                    )}
                </ul>
            )}
        </div>
    );
});
