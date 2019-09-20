import { Button, Tooltip } from 'antd';
import * as React from 'react';
import { useDispatch } from 'react-redux';

import { Shortcut } from '@app/core';

import {
    DiagramItemSet,
    getDiagram,
    getSelectedItems,
    pasteItems,
    removeItems,
    useStore
} from '@app/wireframes/model';

import { SerializerContext } from '@app/context';

const OFFSET = 50;

export const ClipboardMenu = React.memo(() => {
    let [offset, setOffset] = React.useState<number>();

    const [clipboard, setClipboard] = React.useState<string>();

    const dispatch = useDispatch();
    const selectedDiagram = useStore(s => getDiagram(s));
    const selectedItems = useStore(s => getSelectedItems(s));
    const serializer = React.useContext(SerializerContext);
    const canCopy = selectedItems.length > 0;

    const doCopy = React.useCallback(() => {
        if (selectedDiagram) {
            const set =
                DiagramItemSet.createFromDiagram(
                    selectedItems,
                    selectedDiagram);

            const json = serializer.serializeSet(set);

            setClipboard(json);
            setOffset(0);
        }
    }, [offset, selectedDiagram, selectedItems, serializer]);

    const doCut = React.useCallback(() => {
        if (selectedDiagram) {
            doCopy();

            dispatch(removeItems(selectedDiagram, selectedItems));
        }
    }, [doCopy]);

    const doPaste = React.useCallback(() => {
        if (selectedDiagram) {
            setOffset(offset += OFFSET);

            dispatch(pasteItems(selectedDiagram, clipboard, offset));
        }
    }, [clipboard, offset, selectedDiagram]);

    return (
        <>
            <Tooltip mouseEnterDelay={1} title='Copy items (CTRL + C)'>
                <Button className='menu-item' size='large'
                    disabled={!canCopy}
                    onClick={doCopy}>
                    <i className='icon-copy' />
                </Button>
            </Tooltip>

            <Shortcut disabled={!canCopy} onPressed={doCopy} keys='ctrl+c' />

            <Tooltip mouseEnterDelay={1} title='Cut items (CTRL + X)'>
                <Button className='menu-item' size='large'
                    disabled={!canCopy}
                    onClick={doCut}>
                    <i className='icon-cut' />
                </Button>
            </Tooltip>

            <Shortcut disabled={!canCopy} onPressed={doCut} keys='ctrl+x' />

            <Tooltip mouseEnterDelay={1} title='Paste items (CTRL + V)'>
                <Button className='menu-item' size='large'
                    disabled={!clipboard}
                    onClick={doPaste}>
                    <i className='icon-paste' />
                </Button>
            </Tooltip>

            <Shortcut disabled={!clipboard} onPressed={doPaste} keys='ctrl+v' />
        </>
    );
});