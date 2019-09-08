import { Button, Icon, Modal, Tooltip } from 'antd';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Shortcut, Title } from '@app/core';

import {
    newDiagram,
    saveDiagramAsync,
    toggleInfoDialog,
    useStore
} from '@app/wireframes/model';

const text = require('@app/legal.html');

export const LoadingMenu = () => {
    const dispatch = useDispatch();
    const readToken = useStore(s => s.loading.readToken);
    const showInfoDialog = useStore(s => s.ui.showInfoDialog);

    const title =  readToken && readToken.length > 0 ?
        `mydraft.cc - Diagram ${readToken}` :
        'mydraft.cc - Diagram (unsaved)';

    const doNewDiagram = React.useCallback(() => {
        dispatch(newDiagram());
    }, [dispatch]);

    const doSaveDiagram = React.useCallback(() => {
        dispatch(saveDiagramAsync());
    }, [dispatch]);

    const doOpenInfoDialog = React.useCallback(() => {
        dispatch(toggleInfoDialog(true));
    }, [dispatch]);

    const doCloseInfoDialog = React.useCallback(() => {
        dispatch(toggleInfoDialog(false));
    }, [dispatch]);

    return (
        <>
            <Title text={title} />

            <Tooltip mouseEnterDelay={1} title='New Diagram (CTRL + N)'>
                <Button className='menu-item' size='large'
                    onClick={doNewDiagram}>
                    <i className='icon-new' />&nbsp;New
                </Button>
            </Tooltip>

            <Shortcut onPressed={doNewDiagram} keys='ctrl+n' />

            <Tooltip mouseEnterDelay={1} title='New Diagram (CTRL + S)'>
                <Button type='primary' size='large'
                    onClick={doSaveDiagram}>
                    <i className='icon-save' />&nbsp;Save
                </Button>
            </Tooltip>

            <Shortcut onPressed={doSaveDiagram} keys='ctrl+s' />

            <Button className='menu-item' size='large' onClick={doOpenInfoDialog}>
                <Icon type='question-circle-o' />
            </Button>

            <Modal title='About' visible={showInfoDialog} onOk={doCloseInfoDialog} onCancel={doCloseInfoDialog}>
                <div dangerouslySetInnerHTML={{__html: text }} />
            </Modal>
        </>
    );
};