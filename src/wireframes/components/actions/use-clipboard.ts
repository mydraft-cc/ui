/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { ClipboardCopyEvent, ClipboardPasteEvent, useClipboard as useClipboardProvider } from '@app/core';
import { texts } from '@app/texts';
import { DiagramItemSet, getDiagram, getSelectedItems, pasteItems, removeItems, Serializer, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

const OFFSET = 50;
const PREFIX = 'my-draft:';

export function useClipboard() {
    const dispatch = useDispatch();
    const offset = React.useRef(0);
    const selectedDiagram = useStore(getDiagram);
    const selectedItems = useStore(getSelectedItems);
    const canCopy = selectedItems.length > 0;

    const clipboard = useClipboardProvider({ 
        onPaste: (event: ClipboardPasteEvent) => {
            const text = event.items[0]['text'] as string;
    
            if (selectedDiagram && text && text.indexOf(PREFIX) === 0) {
                offset.current += OFFSET;
    
                dispatch(pasteItems(selectedDiagram, text.substring(PREFIX.length), offset.current));
                return true;
            }
    
            return;
        },
        onCopy: (event: ClipboardCopyEvent) => {
            if (selectedDiagram) {
                const set =
                    DiagramItemSet.createFromDiagram(
                        selectedItems,
                        selectedDiagram);
    
                event.clipboard.set(`${PREFIX}${JSON.stringify(Serializer.serializeSet(set))}`);
    
                if (event.isCut) {
                    dispatch(removeItems(selectedDiagram, selectedItems));
                }
                
                offset.current = 0;
            }

            return true;
        },
    });

    const copy: UIAction = React.useMemo(() => ({
        disabled: !canCopy,
        icon: 'icon-copy',
        label: texts.common.copy,
        tooltip: texts.common.copyTooltip,
        onAction: clipboard.copy,
    }), [canCopy, clipboard]);

    const cut: UIAction = React.useMemo(() => ({
        disabled: !canCopy,
        icon: 'icon-cut',
        label: texts.common.cut,
        tooltip: texts.common.cutTooltip,
        onAction: clipboard.cut,
    }), [canCopy, clipboard]);

    const paste: UIAction = React.useMemo(() => ({
        disabled: !clipboard,
        icon: 'icon-paste',
        label: texts.common.paste,
        tooltip: texts.common.pasteTooltip,
        onAction: clipboard.paste,
    }), [clipboard]);

    return { copy, cut, paste };
}
