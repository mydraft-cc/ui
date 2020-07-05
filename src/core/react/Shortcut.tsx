/*
 * Notifo.io
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

    // Triggered when the keys are pressed.
    onPressed: () => any;
}

export class Shortcut extends React.Component<ShortcutProps> {
    public componentDidMount() {
        Mousetrap.bind(this.props.keys, (e) =>  {
            if (!this.props.disabled) {
                this.props.onPressed();

                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }

            return false;
        });
    }

    public componentWillUnmount() {
        Mousetrap.unbind(this.props.keys);
    }

    public shouldComponentUpdate() {
        return false;
    }

    public render(): any {
        return null;
    }
}
