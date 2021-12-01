/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { IconInfo } from '@app/wireframes/model';
import * as React from 'react';
import { useDrag } from 'react-dnd';

interface IconProps {
    // The icon data.
    icon: IconInfo;
}

export const Icon = React.memo((props: IconProps) => {
    const { icon } = props;

    const [, drag] = useDrag({
        item: { text: icon.text, fontFamily: icon.fontFamily },
        previewOptions: {
            anchorX: 0,
            anchorY: 0,
        },
        type: 'DND_ICON',
    });

    return (
        <i ref={drag} className={icon.fontClass}>{icon.text}</i>
    );
});
