import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Button, Tooltip } from 'antd';

import { MathHelper, Shortcut } from '@app/core';

import {
    Diagram,
    DiagramGroup,
    DiagramItem,
    EditorState,
    getSelection,
    groupItems,
    removeItems,
    UndoableState,
    ungroupItems
} from '@app/wireframes/model';

interface ArrangeMenuProps {
    // Indicates if items can be grouped.
    canGroup: boolean;

    // Indicates if items can be ungrouped.
    canUngroup: boolean;

    // Indicates if items can be removed.
    canRemove: boolean;

    // The selected diagram.
    selectedDiagram: Diagram | null;

    // The selected items.
    selectedItems: DiagramItem[];

    // The selected groups.
    selectedGroups: DiagramGroup[];

    // Group items.
    groupItems: (diagram: Diagram, items: DiagramItem[], id: string) => void;

    // Remove items.
    removeItems: (diagram: Diagram, items: DiagramItem[]) => void;

    // Ungroup items.
    ungroupItems: (diagram: Diagram, groups: DiagramGroup[]) => void;
}

const mapStateToProps = (state: { editor: UndoableState<EditorState> }) => {
    const { diagram, items } = getSelection(state);

    const groups = items.filter(s => s instanceof DiagramGroup);

    return {
        selectedDiagram: diagram,
        selectedGroups: groups,
        selectedItems: items,
        canGroup: items.length > 1,
        canRemove: items.length > 0,
        canUngroup: groups.length > 0
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    groupItems, removeItems, ungroupItems
}, dispatch);

class ArrangeMenu extends React.PureComponent<ArrangeMenuProps> {
    private doGroup = () => {
        this.props.groupItems(this.props.selectedDiagram!, this.props.selectedItems, MathHelper.guid());
    }

    private doUngroup = () => {
        this.props.ungroupItems(this.props.selectedDiagram!, this.props.selectedGroups);
    }

    private doRemove = () => {
        this.props.removeItems(this.props.selectedDiagram!, this.props.selectedItems);
    }

    public render() {
        return (
            <>
                <Tooltip mouseEnterDelay={1} title='Group items (CTRL + G)'>
                    <Button className='menu-item' size='large'
                        disabled={!this.props.canGroup}
                        onClick={this.doGroup}>
                        <i className='icon-group' />
                    </Button>
                </Tooltip>

                <Shortcut disabled={!this.props.canGroup} onPressed={this.doGroup} keys='ctrl+g' />

                <Tooltip mouseEnterDelay={1} title='Ungroup items (CTRL + SHIFT + G)'>
                    <Button className='menu-item' size='large'
                        disabled={!this.props.canUngroup}
                        onClick={this.doUngroup}>
                        <i className='icon-ungroup' />
                    </Button>
                </Tooltip>

                <Shortcut disabled={!this.props.canUngroup} onPressed={this.doUngroup} keys='ctrl+shift+g' />

                <Tooltip mouseEnterDelay={1} title='Delete selected items (DELETE)'>
                    <Button className='menu-item' size='large'
                        disabled={!this.props.canRemove}
                        onClick={this.doRemove}>
                        <i className='icon-delete' />
                    </Button>
                </Tooltip>

                <Shortcut disabled={!this.props.canRemove} onPressed={this.doRemove} keys='del' />
                <Shortcut disabled={!this.props.canRemove} onPressed={this.doRemove} keys='backspace' />
            </>
        );
    }
}

export const ArrangeMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ArrangeMenu);