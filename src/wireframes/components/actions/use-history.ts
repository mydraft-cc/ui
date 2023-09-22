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
    const undoManager = useUndoManager();

    const redoAction: UIAction = React.useMemo(() => ({
        disabled: !undoManager.canRedo,
        icon: 'icon-redo',
        label: texts.common.redo,
        shortcut: 'MOD + Y',
        tooltip: texts.common.redo,
        onAction: undoManager.redo,
    }), [undoManager.canRedo, undoManager.redo]);

    const undoAction: UIAction = React.useMemo(() => ({
        disabled: !undoManager.canUndo,
        icon: 'icon-undo',
        label: texts.common.undo,
        shortcut: 'MOD + Z',
        tooltip: texts.common.undo,
        onAction: undoManager.undo,
    }), [undoManager.canUndo, undoManager.undo]);

    return { redo: redoAction, undo: undoAction };
}
