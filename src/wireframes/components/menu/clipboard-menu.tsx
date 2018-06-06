import { Button, Tooltip } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';

import { Shortcut } from '@app/core';

import {
    Diagram,
    DiagramItemSet,
    EditorStateInStore,
    getSelection,
    pasteItems,
    removeItems,
    Serializer
} from '@app/wireframes/model';

import { SerializerContext } from '@app/context';

interface ClipboardMenuProps {
    // Indicates if items can be copied.
    canCopy: boolean;

    // The selected diagram.
    selectedDiagram: Diagram;

    // The selected items.
    selectedItemIds: string[];

    // Remove items.
    removeItems: (diagram: Diagram, items: string[]) => any;

    // Ungroup items.
    pasteItems: (diagram: Diagram, json: string, offset?: number) => any;
}

interface ClipboardMenuState {
    clipboard?: string;

    offset: number;
}

const mapStateToProps = (state: EditorStateInStore) => {
    const { diagram, items } = getSelection(state);

    return {
        selectedDiagram: diagram,
        selectedItemIds: items.map(x => x.id),
        canCopy: items.length > 0
    };
};

const mapDispatchToProps = (dispatch: Dispatch<any>) => bindActionCreators({
    removeItems, pasteItems
}, dispatch);

const OFFSET = 50;

class ClipboardMenu extends React.PureComponent<ClipboardMenuProps, ClipboardMenuState> {
    constructor(props: ClipboardMenuProps) {
        super(props);

        this.state = { offset: 0 };
    }

    private doCopy = (serializer: Serializer) => {
        const set =
            DiagramItemSet.createFromDiagram(
                this.props.selectedItemIds,
                this.props.selectedDiagram);

        this.setState({ offset: 0, clipboard: serializer.serializeSet(set) });
    }

    private doCut = (serializer: Serializer) => {
        this.doCopy(serializer);

        this.props.removeItems(this.props.selectedDiagram, this.props.selectedItemIds);
    }

    private doPaste = () => {
        this.setState(s => ({ offset: s.offset + OFFSET, clipboard: s.clipboard }));

        this.props.pasteItems(this.props.selectedDiagram, this.state.clipboard!, this.state.offset);
    }

    public render() {
        return (
            <SerializerContext.Consumer>
                {serializer =>
                <>
                    <Tooltip mouseEnterDelay={1} title='Copy items (CTRL + C)'>
                        <Button className='menu-item' size='large'
                            disabled={!this.props.canCopy}
                            onClick={() => this.doCopy(serializer)}>
                            <i className='icon-copy' />
                        </Button>
                    </Tooltip>

                    <Shortcut disabled={!this.props.canCopy} onPressed={() => this.doCopy(serializer)} keys='ctrl+c' />

                    <Tooltip mouseEnterDelay={1} title='Cut items (CTRL + X)'>
                        <Button className='menu-item' size='large'
                            disabled={!this.props.canCopy}
                            onClick={() => this.doCut(serializer)}>
                            <i className='icon-cut' />
                        </Button>
                    </Tooltip>

                    <Shortcut disabled={!this.props.canCopy} onPressed={() => this.doCut(serializer)} keys='ctrl+x' />

                    <Tooltip mouseEnterDelay={1} title='Paste items (CTRL + V)'>
                        <Button className='menu-item' size='large'
                            disabled={!this.state.clipboard}
                            onClick={this.doPaste}>
                            <i className='icon-paste' />
                        </Button>
                    </Tooltip>

                    <Shortcut disabled={!this.state.clipboard} onPressed={this.doPaste} keys='ctrl+v' />
                </>
                }
            </SerializerContext.Consumer>
        );
    }
}

export const ClipboardMenuContainer = connect(
    mapStateToProps,
    mapDispatchToProps
)(ClipboardMenu);