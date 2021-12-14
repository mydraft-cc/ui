/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { SerializerContext } from '@app/context';
import { texts } from '@app/texts';
import { DiagramItemSet, getDiagram, getSelectedItems, pasteItems, removeItems, useStore } from '@app/wireframes/model';
import * as React from 'react';
import { useDispatch } from 'react-redux';
import { UIAction } from './shared';

const OFFSET = 50;

export function useClipboard() {
    const dispatch = useDispatch();
    const [offset, setOffset] = React.useState<number>();
    const selectedDiagram = useStore(getDiagram);
    const selectedItems = useStore(getSelectedItems);
    const serializer = React.useContext(SerializerContext);
    const canCopy = selectedItems.length > 0;
    const [clipboard, setClipboard] = React.useState<string>();

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
    }, [selectedDiagram, selectedItems, serializer]);

    const doCut = React.useCallback(() => {
        if (selectedDiagram) {
            doCopy();

            dispatch(removeItems(selectedDiagram, selectedItems));
        }
    }, [dispatch, doCopy, selectedDiagram, selectedItems]);

    const doPaste = React.useCallback(() => {
        if (selectedDiagram) {
            setOffset(value => value + OFFSET);

            dispatch(pasteItems(selectedDiagram, clipboard, offset + OFFSET));
        }
    }, [clipboard, dispatch, offset, selectedDiagram]);

    const copy: UIAction = React.useMemo(() => ({
        disabled: !canCopy,
        icon: 'icon-copy',
        label: texts.common.copy,
        shortcut: 'CTRL + C',
        tooltip: texts.common.copyTooltip,
        onAction: doCopy,
    }), [canCopy, doCopy]);

    const cut: UIAction = React.useMemo(() => ({
        disabled: !canCopy,
        icon: 'icon-cut',
        label: texts.common.cut,
        shortcut: 'CTRL + X',
        tooltip: texts.common.cutTooltip,
        onAction: doCut,
    }), [canCopy, doCut]);

    const paste: UIAction = React.useMemo(() => ({
        disabled: !clipboard,
        icon: 'icon-paste',
        label: texts.common.paste,
        shortcut: 'CTRL + V',
        tooltip: texts.common.pasteTooltip,
        onAction: doPaste,
    }), [clipboard, doPaste]);

    return { copy, cut, paste };
}
