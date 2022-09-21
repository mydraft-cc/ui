/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { SerializerContext } from '@app/context';
import { useEventCallback } from '@app/core';
import { texts } from '@app/texts';
import { DiagramItemSet, getDiagram, getSelectedItems, pasteItems, removeItems, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

const OFFSET = 50;

export function useClipboard() {
    const dispatch = useDispatch();
    const offset = React.useRef(0);
    const selectedDiagram = useStore(getDiagram);
    const selectedItems = useStore(getSelectedItems);
    const serializer = React.useContext(SerializerContext);
    const canCopy = selectedItems.length > 0;
    const [clipboard, setClipboard] = React.useState<string>();

    const doCopy = useEventCallback(() => {
        if (selectedDiagram) {
            const set =
                DiagramItemSet.createFromDiagram(
                    selectedItems,
                    selectedDiagram);

            const json = serializer.serializeSet(set);

            setClipboard(json);
            
            offset.current = 0;
        }
    });

    const doCut = useEventCallback(() => {
        if (selectedDiagram) {
            doCopy();

            dispatch(removeItems(selectedDiagram, selectedItems));
        }
    });

    const doPaste = useEventCallback(() => {
        if (selectedDiagram && clipboard) {
            offset.current += OFFSET;

            dispatch(pasteItems(selectedDiagram, clipboard, offset.current));
        }
    });

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
