/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';

export const Title = React.memo(({ text }: { text: string }) => {
    React.useEffect(() => {
        document.title = text;
    }, [text]);

    return null;
});
