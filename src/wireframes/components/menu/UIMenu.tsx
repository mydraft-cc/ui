/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { PlayCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import * as React from 'react';

export interface UIMenuProps {
    // The presentation callback.
    onPlay?: () => void;
}

export const UIMenu = React.memo((props: UIMenuProps) => {
    const { onPlay } = props;

    return (
        <>
            <Button className='menu-item' onClick={onPlay} icon={<PlayCircleOutlined />} />
        </>
    );
});
