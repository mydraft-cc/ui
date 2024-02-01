/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { useEventCallback, useOpenFile } from '@app/core';
import { useAppDispatch } from '@app/store';
import { texts } from '@app/texts';
import { getDiagrams, loadDiagramFromFile, newDiagram, saveDiagramToFile, saveDiagramToServer, useStore } from '@app/wireframes/model';
import { UIAction } from './shared';

export function useLoading() {
    const dispatch = useAppDispatch();
    const diagrams = useStore(getDiagrams);

    const canSave = React.useMemo(() => {
        for (const diagram of diagrams.values) {
            if (diagram.items.size > 0) {
                return true;
            }
        }

        return false;
    }, [diagrams]);
    
    const openHandler = useOpenFile('.json', file => {
        dispatch(loadDiagramFromFile({ file }));
    });

    const doNew = useEventCallback(() => {
        dispatch(newDiagram(true));
    });

    const doSave = useEventCallback(() => {
        dispatch(saveDiagramToServer({ navigate: true }));
    });

    const doSaveToFile = useEventCallback(() => {
        dispatch(saveDiagramToFile());
    });

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

    const saveDiagramToFileAction: UIAction = React.useMemo(() => ({
        disabled: !canSave,
        icon: 'icon-save',
        label: texts.common.saveDiagramToFileTooltip,
        tooltip: texts.common.saveDiagramToFileTooltip,
        onAction: doSaveToFile,
    }), [doSaveToFile, canSave]);

    const openDiagramAction: UIAction = React.useMemo(() => ({
        disabled: false,
        icon: 'icon-folder-open',
        label: texts.common.openFromFile,
        tooltip: texts.common.openFromFileTooltip,
        onAction: openHandler,
    }), [openHandler]);

    return { newDiagram: newDiagramAction, openDiagramAction, saveDiagram, saveDiagramToFile: saveDiagramToFileAction };
}
