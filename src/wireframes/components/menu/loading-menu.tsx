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

    // The window title.
    title: string;

    // Creates a new diagram.
    newDiagram: () => any;

    // Creates a new diagram.
    saveDiagramAsync: () => any;

    // Toggle the info dialog.
    toggleInfoDialog: (isOpen: boolean) => any;
}

const mapStateToProps = (state: LoadingStateInStore & UIStateInStore) => {
    const readToken = state.loading.readToken;

    const title =  readToken && readToken.length > 0 ?
        `mydraft.cc - Diagram ${readToken}` :
        'mydraft.cc - Diagram (unsaved)';

    return { readToken: readToken, title, showInfoDialog: state.ui.showInfoDialog };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    newDiagram, saveDiagramAsync, toggleInfoDialog
}, dispatch);

class LoadingMenu extends React.PureComponent<LoadingMenuProps> {
    private doNewDiagram = () => {
        this.props.newDiagram();
    }

    private doSaveDiagram = () => {
        this.props.saveDiagramAsync();
    }

    private doOpenInfoDialog = () => {
        this.props.toggleInfoDialog(true);
    }

    private doCloseInfoDialog = () => {
        this.props.toggleInfoDialog(false);
    }

    public render() {
        return (
            <>
                <Title text={this.props.title} />

                <Tooltip mouseEnterDelay={1} title='New Diagram (CTRL + N)'>
                    <Button className='menu-item' size='large'
                        onClick={this.doNewDiagram}>
                        <i className='icon-new' />&nbsp;New
                    </Button>
                </Tooltip>

                <Shortcut onPressed={this.doNewDiagram} keys='ctrl+n' />

                <Tooltip mouseEnterDelay={1} title='New Diagram (CTRL + S)'>
                    <Button type='primary' size='large'
                        onClick={this.doSaveDiagram}>
                        <i className='icon-save' />&nbsp;Save
                    </Button>
                </Tooltip>

                <Shortcut onPressed={this.doSaveDiagram} keys='ctrl+s' />

                <Button className='menu-item' size='large' onClick={this.doOpenInfoDialog}>
                    <Icon type='question-circle-o' />
                </Button>

                <Modal title='About' visible={this.props.showInfoDialog} onOk={this.doCloseInfoDialog} onCancel={this.doCloseInfoDialog}>
                    <div dangerouslySetInnerHTML={{__html: text }} />
                </Modal>
            </>
        );
    }
}

export const LoadingMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(LoadingMenu);