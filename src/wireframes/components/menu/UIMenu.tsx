import { Button, Icon, Tooltip } from 'antd';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Shortcut } from '@app/core';

import { setZoom, useStore } from '@app/wireframes/model';

export const UIMenu = React.memo(() => {
    const dispatch = useDispatch();
    const zoom = useStore(x => x.ui.zoom);
    const canZoomIn = zoom < 2;
    const canZoomOut = zoom > .25;

    const doZoomOut = React.useCallback(() => {
        dispatch(setZoom(zoom - .25));
    }, [zoom]);

    const doZoomIn = React.useCallback(() => {
        dispatch(setZoom(zoom + .25));
    }, [zoom]);

    return (
        <>
            <Tooltip mouseEnterDelay={1} title='Zoom Out (ALT + [-])'>
                <Button className='menu-item' size='large'
                    disabled={!canZoomOut}
                    onClick={doZoomOut}>
                    <Icon type='minus-circle-o' />
                </Button>
            </Tooltip>

            <Shortcut disabled={!canZoomOut} onPressed={doZoomOut} keys='alt+-' />

            <span className='menu-item'>{zoom * 100}</span>

            <Tooltip mouseEnterDelay={1} title='Zoom In (ALT + [+])'>
                <Button className='menu-item' size='large'
                    disabled={!canZoomIn}
                    onClick={doZoomIn}>
                    <Icon type='plus-circle-o' />
                </Button>
            </Tooltip>

            <Shortcut disabled={!canZoomIn} onPressed={doZoomIn} keys='alt+plus' />
        </>
    );
});