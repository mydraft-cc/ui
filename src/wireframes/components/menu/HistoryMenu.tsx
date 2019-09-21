import { Button, Tooltip } from 'antd';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Shortcut } from '@app/core';

import {
    redo,
    undo,
    useStore
} from '@app/wireframes/model';

export const HistoryMenu = React.memo(() => {
    const dispatch = useDispatch();
    const canRedo = useStore(s => s.editor.canRedo);
    const canUndo = useStore(s => s.editor.canUndo);

    const doRedo = React.useCallback(() => {
        dispatch(redo());
    }, []);

    const doUndo = React.useCallback(() => {
        dispatch(undo());
    }, []);

    return (
        <>
            <Tooltip mouseEnterDelay={1} title='Undo (CTRL + Z)'>
                <Button className='menu-item' size='large'
                    disabled={!canUndo}
                    onClick={doUndo}>
                    <i className='icon-undo' />
                </Button>
            </Tooltip>

            <Shortcut keys='ctrl+z' disabled={!canUndo} onPressed={doUndo} />

            <Tooltip mouseEnterDelay={1} title='Redo (CTRL + Y)'>
                <Button className='menu-item' size='large'
                    disabled={!canRedo}
                    onClick={doRedo}>
                    <i className='icon-redo' />
                </Button>
            </Tooltip>

            <Shortcut keys='ctrl+y' disabled={!canRedo} onPressed={doRedo} />
        </>
    );
});