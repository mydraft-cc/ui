/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { ClipboardCopyEvent, ClipboardPasteEvent, useClipboard as useClipboardProvider } from '@app/core';
import { useAppDispatch } from '@app/store';
import { texts } from '@app/texts';
import { getDiagram, getSelection, pasteItems, removeItems, Serializer, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

const OFFSET = 50;
const PREFIX = 'my-draft:';

export function useClipboard() {
    const dispatch = useAppDispatch();
    const offset = React.useRef(0);
    const selectedDiagram = useStore(getDiagram);
    const selectionSet = useStore(getSelection);
    const canCopy = selectionSet.selection.size > 0;

    const clipboard = useClipboardProvider({ 
        onPaste: (event: ClipboardPasteEvent) => {
            const text = (event.items[0] as any)['text'] as string;
    
            if (selectedDiagram && text && text.indexOf(PREFIX) === 0) {
                offset.current += OFFSET;
    
                dispatch(pasteItems(selectedDiagram, text.substring(PREFIX.length), offset.current));
                return true;
            }
    
            return;
        },
        onCopy: (event: ClipboardCopyEvent) => {
            if (selectedDiagram) {    
                event.clipboard.set(`${PREFIX}${JSON.stringify(Serializer.serializeSet(selectionSet))}`);
    
                if (event.isCut) {
                    dispatch(removeItems(selectedDiagram, selectionSet.selectedItems));
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
