import { Button, Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Shortcut } from '@app/core';

import {
    EditorStateInStore,
    redo,
    undo
} from '@app/wireframes/model';

interface HistoryMenuProps {
    // Indicated if the state can be undo.
    canUndo: boolean;

    // Indicated if the state can be redo.
    canRedo: boolean;

    // Undo the latest action.
    undo: () => any;

    // Redo the latest undone action.
    redo: () => any;
}

class HistoryMenu extends React.PureComponent<HistoryMenuProps> {
    private doUndo = () => {
        this.props.undo();
    }

    private doRedo = () => {
        this.props.redo();
    }

    public render() {
        const { canRedo, canUndo } = this.props;

        return (
            <>
                <Tooltip mouseEnterDelay={1} title='Undo (CTRL + Z)'>
                    <Button className='menu-item' size='large'
                        disabled={!canUndo}
                        onClick={this.doUndo}>
                        <i className='icon-undo' />
                    </Button>
                </Tooltip>

                <Shortcut keys='ctrl+z' disabled={!canUndo} onPressed={this.doUndo} />

                <Tooltip mouseEnterDelay={1} title='Redo (CTRL + Y)'>
                    <Button className='menu-item' size='large'
                        disabled={!canRedo}
                        onClick={this.doRedo}>
                        <i className='icon-redo' />
                    </Button>
                </Tooltip>

                <Shortcut keys='ctrl+y' disabled={!canRedo} onPressed={this.doRedo} />
            </>
        );
    }
}

const mapStateToProps = (state: EditorStateInStore) => {
    return {
        canUndo: state.editor.canUndo,
        canRedo: state.editor.canRedo
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    undo, redo
}, dispatch);

export const HistoryMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(HistoryMenu);