/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { SerializerContext } from '@app/context';
import { texts } from '@app/texts';
import { DiagramItemSet, getDiagram, getSelectedItems, pasteItems, removeItems, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

const OFFSET = 50;

export function useClipboard() {
    const dispatch = useDispatch();
    const offset = React.useRef(0);
    const selectedDiagram = useStore(getDiagram);
    const selectedDiagramRef = React.useRef(selectedDiagram);
    const selectedItems = useStore(getSelectedItems);
    const selectedItemsRef = React.useRef(selectedItems);
    const serializer = React.useContext(SerializerContext);
    const canCopy = selectedItems.length > 0;
    const [clipboard, setClipboard] = React.useState<string>();

    selectedDiagramRef.current = selectedDiagram;
    selectedItemsRef.current = selectedItems;

    const doCopy = React.useCallback(() => {
        if (selectedDiagramRef.current) {
            const set =
                DiagramItemSet.createFromDiagram(
                    selectedItemsRef.current,
                    selectedDiagramRef.current);

            const json = serializer.serializeSet(set);

            setClipboard(json);
            
            offset.current = 0;
        }
    }, [serializer]);

    const doCut = React.useCallback(() => {
        if (selectedDiagramRef.current) {
            doCopy();

            dispatch(removeItems(selectedDiagramRef.current, selectedItemsRef.current));
        }
    }, [dispatch, doCopy]);

    const doPaste = React.useCallback(() => {
        if (selectedDiagramRef.current && clipboard) {
            offset.current += OFFSET;

            dispatch(pasteItems(selectedDiagramRef.current, clipboard, offset.current));
        }
    }, [dispatch, clipboard]);

    const copy: UIAction = React.useMemo(() => ({
        disabled: !canCopy,
        icon: 'icon-copy',
        label: texts.common.copy,
        shortcut: 'MOD + C',
        tooltip: texts.common.copyTooltip,
        onAction: doCopy,
    }), [canCopy, doCopy]);

    const cut: UIAction = React.useMemo(() => ({
        disabled: !canCopy,
        icon: 'icon-cut',
        label: texts.common.cut,
        shortcut: 'MOD + X',
        tooltip: texts.common.cutTooltip,
        onAction: doCut,
    }), [canCopy, doCut]);

    const paste: UIAction = React.useMemo(() => ({
        disabled: !clipboard,
        icon: 'icon-paste',
        label: texts.common.paste,
        shortcut: 'MOD + V',
        tooltip: texts.common.pasteTooltip,
        onAction: doPaste,
    }), [clipboard, doPaste]);

    return { copy, cut, paste };
}
