import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Button, Tooltip } from 'antd';

import { Shortcut } from '@app/core';

import {
    EditorState,
    redo,
    undo,
    UndoableState
} from '@app/wireframes/model';

interface HistoryMenuProps {
    // Indicated if the state can be undo.
    canUndo: boolean;

    // Indicated if the state can be redo.
    canRedo: boolean;

    // Undo the latest action.
    undo: () => void;

    // Redo the latest undone action.
    redo: () => void;
}

const mapStateToProps = (state: { editor: UndoableState<EditorState> }) => {
    return {
        canUndo: state.editor.canUndo,
        canRedo: state.editor.canRedo
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    undo, redo
}, dispatch);

const HistoryMenu = (props: HistoryMenuProps) => {
    const doUndo = () => {
        props.undo();
    };

    const doRedo = () => {
        props.redo();
    };

    return (
        <>
            <Tooltip mouseEnterDelay={1} title='Undo (CTRL + Z)'>
                <Button className='menu-item' size='large'
                    disabled={!props.canUndo}
                    onClick={() => doUndo()}>
                    <i className='icon-undo' />
                </Button>
            </Tooltip>

            <Shortcut keys='ctrl+z' disabled={!props.canUndo} onPressed={() => doUndo()} />

            <Tooltip mouseEnterDelay={1} title='Redo (CTRL + Y)'>
                <Button className='menu-item' size='large'
                    disabled={!props.canRedo}
                    onClick={() => doRedo()}>
                    <i className='icon-redo' />
                </Button>
            </Tooltip>

            <Shortcut keys='ctrl+y' disabled={!props.canRedo} onPressed={() => doRedo()} />
        </>
    );
};

export const HistoryMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(HistoryMenu);