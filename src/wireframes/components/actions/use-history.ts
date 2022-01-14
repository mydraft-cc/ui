/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { texts } from '@app/texts';
import { redo, undo, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

export function useHistory() {
    const dispatch = useDispatch();
    const canRedo = useStore(s => s.editor.canRedo);
    const canUndo = useStore(s => s.editor.canUndo);

    const doRedo = React.useCallback(() => {
        dispatch(redo());
    }, [dispatch]);

    const doUndo = React.useCallback(() => {
        dispatch(undo());
    }, [dispatch]);

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
