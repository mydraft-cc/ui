/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { texts } from '@app/texts';
import { useUndoManager } from '@app/wireframes/collaboration';
import { UIAction } from './shared';

export function useHistory() {
    const { canRedo, canUndo, redo: doRedo, undo: doUndo } = useUndoManager();

    const redoAction: UIAction = React.useMemo(() => ({
        disabled: !canRedo,
        icon: 'icon-redo',
        label: texts.common.redo,
        shortcut: 'MOD + Y',
        tooltip: texts.common.redo,
        onAction: doRedo,
    }), [canRedo, doRedo]);

    const undoAction: UIAction = React.useMemo(() => ({
        disabled: !canUndo,
        icon: 'icon-undo',
        label: texts.common.undo,
        shortcut: 'MOD + Z',
        tooltip: texts.common.undo,
        onAction: doUndo,
    }), [canUndo, doUndo]);

    return { redo: redoAction, undo: undoAction };
}
