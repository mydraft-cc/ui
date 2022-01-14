/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { useDispatch } from 'react-redux';
import { texts } from '@app/texts';
import { getDiagrams, newDiagram, saveDiagramAsync, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

export function useLoading() {
    const dispatch = useDispatch();
    const diagrams = useStore(getDiagrams);

    const canSave = React.useMemo(() => {
        for (const diagram of diagrams.values) {
            if (diagram.items.size > 0) {
                return true;
            }
        }

        return false;
    }, [diagrams]);

    const doNew = React.useCallback(() => {
        dispatch(newDiagram({ navigate: true }));
    }, [dispatch]);

    const doSave = React.useCallback(() => {
        dispatch(saveDiagramAsync({ navigate: true }));
    }, [dispatch]);

    const newDiagramAction: UIAction = React.useMemo(() => ({
        disabled: false,
        icon: 'icon-new',
        label: texts.common.newDiagram,
        shortcut: 'MOD + N',
        tooltip: texts.common.newDiagramTooltip,
        onAction: doNew,
    }), [doNew]);

    const saveDiagram: UIAction = React.useMemo(() => ({
        disabled: !canSave,
        icon: 'icon-save',
        label: texts.common.saveDiagramTooltip,
        shortcut: 'MOD + S',
        tooltip: texts.common.saveDiagramTooltip,
        onAction: doSave,
    }), [doSave, canSave]);

    return { newDiagram: newDiagramAction, saveDiagram };
}
