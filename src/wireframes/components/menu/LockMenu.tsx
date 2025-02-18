/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { ActionMenuButton, useLocking } from './../actions';

export const LockMenu = React.memo(() => {
    const forLocking = useLocking();

    return (
        <ActionMenuButton action={forLocking.lock} />
    );
});
