import { Button, Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Shortcut, Title } from '@app/core';

import {
    LoadingStateInStore,
    newDiagram,
    saveDiagramAsync
} from '@app/wireframes/model';

interface LoadingMenuProps {
    // The current read token.
    readToken: string;

    // Creates a new diagram.
    newDiagram: () => any;

    // Creates a new diagram.
    saveDiagramAsync: () => any;
}

const mapStateToProps = (state: LoadingStateInStore) => {
    return { readToken: state.loading.readToken };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    newDiagram, saveDiagramAsync
}, dispatch);

const LoadingMenu = (props: LoadingMenuProps) => {
    const getText = () => {
        return props.readToken && props.readToken.length > 0 ?
            `mydraft.cc - Diaram ${props.readToken}` :
            'mydract.cc - New Diagram';
    };

    const doNewDiagram = () => {
        props.newDiagram();
    };

    const doSaveDiagram = () => {
        props.saveDiagramAsync();
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
        </>
    );
};

export const LoadingMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(LoadingMenu);