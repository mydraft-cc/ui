import { Button, Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { MathHelper, Shortcut } from '@app/core';

import {
    calculateSelection,
    Diagram,
    DiagramGroup,
    DiagramItem,
    EditorStateInStore,
    getSelection,
    groupItems,
    removeItems,
    selectItems,
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
    groupItems: (diagram: Diagram, items: DiagramItem[], id: string) => any;

    // Remove items.
    removeItems: (diagram: Diagram, items: DiagramItem[]) => any;

    // Ungroup items.
    ungroupItems: (diagram: Diagram, groups: DiagramGroup[]) => any;

    // Selcts items.
    selectItems: (diagram: Diagram, itemsIds: string[]) => any;
}

const mapStateToProps = (state: EditorStateInStore) => {
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
    groupItems, removeItems, ungroupItems, selectItems
}, dispatch);

const ArrangeMenu = (props: ArrangeMenuProps) => {
    const doGroup = () => {
        props.groupItems(props.selectedDiagram!, props.selectedItems, MathHelper.guid());
    };

    const doUngroup = () => {
        props.ungroupItems(props.selectedDiagram!, props.selectedGroups);
    };

    const doRemove = () => {
        props.removeItems(props.selectedDiagram!, props.selectedItems);
    };

    const doSelectAll = () => {
        props.selectItems(props.selectedDiagram!, calculateSelection(props.selectedDiagram!.items.toArray(), props.selectedDiagram!));
    };

    return (
        <>
            <Tooltip mouseEnterDelay={1} title='Group items (CTRL + G)'>
                <Button className='menu-item' size='large'
                    disabled={!props.canGroup}
                    onClick={doGroup}>
                    <i className='icon-group' />
                </Button>
            </Tooltip>

            <Shortcut disabled={!props.canGroup} onPressed={doGroup} keys='ctrl+g' />

            <Tooltip mouseEnterDelay={1} title='Ungroup items (CTRL + SHIFT + G)'>
                <Button className='menu-item' size='large'
                    disabled={!props.canUngroup}
                    onClick={doUngroup}>
                    <i className='icon-ungroup' />
                </Button>
            </Tooltip>

            <Shortcut disabled={!props.canUngroup} onPressed={doUngroup} keys='ctrl+shift+g' />

            <Tooltip mouseEnterDelay={1} title='Delete selected items (DELETE)'>
                <Button className='menu-item' size='large'
                    disabled={!props.canRemove}
                    onClick={doRemove}>
                    <i className='icon-delete' />
                </Button>
            </Tooltip>

            <Shortcut disabled={!props.canRemove} onPressed={doRemove} keys='del' />
            <Shortcut disabled={!props.canRemove} onPressed={doRemove} keys='backspace' />

            <Shortcut disabled={!props.selectedDiagram} onPressed={doSelectAll} keys='ctrl+a' />
        </>
    );
};

export const ArrangeMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ArrangeMenu);