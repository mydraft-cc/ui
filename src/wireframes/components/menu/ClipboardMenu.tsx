/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { ActionMenuButton, useClipboard } from './../actions';

export const ClipboardMenu = React.memo(() => {
    const forClipboard = useClipboard();

    return (
        <>
            <ActionMenuButton action={forClipboard.cut} />
            <ActionMenuButton action={forClipboard.copy} />
            <ActionMenuButton action={forClipboard.paste} />
        </>
    );
});
