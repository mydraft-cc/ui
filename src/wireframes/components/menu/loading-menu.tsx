import { Button, Icon, Modal, Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Shortcut, Title } from '@app/core';

import {
    LoadingStateInStore,
    newDiagram,
    saveDiagramAsync,
    toggleInfoDialog,
    UIStateInStore
} from '@app/wireframes/model';

const text = require('@app/legal.html');

interface LoadingMenuProps {
    // The current read token.
    readToken: string;

    // Indicates if the info dialog, should be shown.
    showInfoDialog: boolean;

    // Creates a new diagram.
    newDiagram: () => any;

    // Creates a new diagram.
    saveDiagramAsync: () => any;

    // Toggle the info dialog.
    toggleInfoDialog: (isOpen: boolean) => any;
}

const mapStateToProps = (state: LoadingStateInStore & UIStateInStore) => {
    return { readToken: state.loading.readToken, showInfoDialog: state.ui.showInfoDialog };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    newDiagram, saveDiagramAsync, toggleInfoDialog
}, dispatch);

const LoadingMenu = (props: LoadingMenuProps) => {
    const getText = () => {
        return props.readToken && props.readToken.length > 0 ?
            `mydraft.cc - Diaram ${props.readToken}` :
            'mydraft.cc - New Diagram';
    };

    const doNewDiagram = () => {
        props.newDiagram();
    };

    const doSaveDiagram = () => {
        props.saveDiagramAsync();
    };

    const doOpenInfoDialog = () => {
        props.toggleInfoDialog(true);
    };

    const doCloseInfoDialog = () => {
        props.toggleInfoDialog(false);
    };

    return (
        <>
            <Title text={getText()} />

            <Tooltip mouseEnterDelay={1} title='New Diagram (CTRL + N)'>
                <Button className='menu-item' size='large'
                    onClick={doNewDiagram}>
                    <i className='icon-new' /> New
                </Button>
            </Tooltip>

            <Shortcut onPressed={doNewDiagram} keys='ctrl+n' />

            <Tooltip mouseEnterDelay={1} title='New Diagram (CTRL + S)'>
                <Button type='primary' size='large'
                    onClick={doSaveDiagram}>
                    <i className='icon-save' /> Save
                </Button>
            </Tooltip>

            <Shortcut onPressed={doSaveDiagram} keys='ctrl+s' />

            <Button className='menu-item' size='large' onClick={doOpenInfoDialog}>
                <Icon type='question-circle-o' />
            </Button>

            <Modal title='About' visible={props.showInfoDialog} onOk={doCloseInfoDialog} onCancel={doCloseInfoDialog}>
                <div dangerouslySetInnerHTML={{__html: text }} />
            </Modal>
        </>
    );
};

export const LoadingMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(LoadingMenu);