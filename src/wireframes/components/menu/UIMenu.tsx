/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { ActionMenuButton, useUI } from '../actions';

export const UIMenu = React.memo(() => {
    const forUI = useUI();

    return (
        <>
            <ActionMenuButton action={forUI.zoomOut} />
            <ActionMenuButton action={forUI.zoomIn} />
        </>
    );
});
