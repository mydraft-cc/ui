/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as Mousetrap from 'mousetrap';
import * as React from 'react';

export interface ShortcutProps {
    // Disable the shortcut
    disabled?: boolean;

    // The key binding.
    keys: string;

    // Allows the default settings.
    allowDefault?: boolean;

    // Triggered when the keys are pressed.
    onPressed: () => any;
}

export const Shortcut = (props: ShortcutProps) => {
    const currentProps = React.useRef(props);

    currentProps.current = props;

    React.useEffect(() => {
        const simplifiedKeys = props.keys.toLocaleLowerCase().replace(/[\s]/g, '');

        Mousetrap.bind(simplifiedKeys, (event) => {
            if (!currentProps.current.disabled) {
                currentProps.current.onPressed();
            }

            if (!currentProps.current.allowDefault) {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
            }

            return false;
        });

        return () => {
            Mousetrap.unbind(simplifiedKeys);
        };
    }, [props.keys]);

    return <></>;
};
