import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux';
import { Button } from 'antd';
import * as React from 'react';

import { MathHelper } from '@app/core';

import {
    Diagram,
    DiagramGroup,
    DiagramItem,
    EditorState,
    getSelection,
    group,
    removeItems,
    UndoableState,
    ungroup
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

    // Remove items.
    removeItems: (diagram: Diagram, items: DiagramItem[]) => void;

    // Group items.
    group: (diagram: Diagram, items: DiagramItem[]) => void;

    // Ungroup items.
    ungroup: (diagram: Diagram, groups: DiagramGroup[]) => void;
}

const mapStateToProps = (state: { editor: UndoableState<EditorState> }) => {
    const { diagram, items} = getSelection(state);

    const groups = items.filter(s =>  s instanceof DiagramGroup);

    return {
        selectedDiagram:  diagram,
        selectedGroups: groups,
        selectedItems: items,
        canGroup: items.length > 1,
        canRemove: items.length > 0,
        canUngroup: groups.length > 0
    };
}

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    group: (d, i) => group(d, i, MathHelper.guid()), removeItems, ungroup
}, dispatch);

const ArrangeMenu = (props: ArrangeMenuProps) => {
    return (
        <>
            <Button className='menu-item' size='large'
                disabled={!props.canGroup}
                onClick={() => props.group(props.selectedDiagram!, props.selectedItems)}>
                <i className='icon-group' />
            </Button>

            <Button className='menu-item' size='large'
                disabled={!props.canUngroup}
                onClick={() => props.ungroup(props.selectedDiagram!, props.selectedGroups)}>
                <i className='icon-ungroup' />
            </Button>

            <Button className='menu-item' size='large'
                disabled={!props.canRemove}
                onClick={() => props.removeItems(props.selectedDiagram!, props.selectedItems)}>
                <i className='icon-delete' />
            </Button>
        </>
    );
}

export const ArrangeMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ArrangeMenu);