import * as React from 'react';
import { useDrag } from 'react-dnd';

import { IconInfo } from '@app/wireframes/model';

interface IconProps {
    // The icon data.
    icon: IconInfo;
}

export const Icon = React.memo((props: IconProps) => {
    const { icon } = props;

    const [, drag] = useDrag({
        item: { text: icon.text, fontFamily: props.icon.fontFamily, type: 'DND_ICON' }
    });

    return (
        <i ref={drag} className={props.icon.fontClass}>{props.icon.text}</i>
    );
});