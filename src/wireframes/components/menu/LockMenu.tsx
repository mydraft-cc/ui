import { Button, Icon, Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Shortcut } from '@app/core';

import {
    Diagram,
    DiagramItem,
    EditorStateInStore,
    getDiagram,
    getSelectedItemWithLocked,
    lockItems,
    unlockItems
} from '@app/wireframes/model';

interface LockMenuProps {
    // The selected diagram.
    selectedDiagram: Diagram | null;

    // The selected item.
    selectedItem: DiagramItem | null;

    // Lock items.
    lockItems: (diagram: Diagram, items: string[]) => any;

    // Unlock items.
    unlockItems: (diagram: Diagram, items: string[]) => any;
}

class LockMenu extends React.PureComponent<LockMenuProps> {
    private doToggle = () => {
        if (this.props.selectedItem) {
            if (this.props.selectedItem.isLocked) {
                this.props.unlockItems(this.props.selectedDiagram!, [this.props.selectedItem.id]);
            } else {
                this.props.lockItems(this.props.selectedDiagram!, [this.props.selectedItem.id]);
            }
        }
    }

    private getIcon = () => {
        return this.props.selectedItem && this.props.selectedItem.isLocked ? 'lock' : 'unlock';
    }

    public render() {
        return (
            <>
                <Shortcut disabled={!this.props.selectedItem} onPressed={this.doToggle} keys='ctl+l' />

                <Tooltip mouseEnterDelay={1} title='Lock or unlock item (CTRL + L)'>
                    <Button className='menu-item' size='large'
                        disabled={!this.props.selectedItem}
                        onClick={this.doToggle}>
                        <Icon type={this.getIcon()} />
                    </Button>
                </Tooltip>
            </>
        );
    }
}

const mapStateToProps = (state: EditorStateInStore) => {
    return {
        selectedDiagram: getDiagram(state),
        selectedItem: getSelectedItemWithLocked(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => bindActionCreators({
    lockItems, unlockItems
}, dispatch);

export const LockMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(LockMenu);