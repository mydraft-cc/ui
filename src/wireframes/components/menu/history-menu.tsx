import { Button, Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

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

class HistoryMenu extends React.PureComponent<HistoryMenuProps> {
    private doUndo = () => {
        this.props.undo();
    }

    private doRedo = () => {
        this.props.redo();
    }

    public render() {
        return (
            <>
                <Tooltip mouseEnterDelay={1} title='Undo (CTRL + Z)'>
                    <Button className='menu-item' size='large'
                        disabled={!this.props.canUndo}
                        onClick={this.doUndo}>
                        <i className='icon-undo' />
                    </Button>
                </Tooltip>

                <Shortcut keys='ctrl+z' disabled={!this.props.canUndo} onPressed={this.doUndo} />

                <Tooltip mouseEnterDelay={1} title='Redo (CTRL + Y)'>
                    <Button className='menu-item' size='large'
                        disabled={!this.props.canRedo}
                        onClick={this.doRedo}>
                        <i className='icon-redo' />
                    </Button>
                </Tooltip>

                <Shortcut keys='ctrl+y' disabled={!this.props.canRedo} onPressed={this.doRedo} />
            </>
        );
    }
}

export const HistoryMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(HistoryMenu);