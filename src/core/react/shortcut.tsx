import * as React from 'react';
import * as Mousetrap from 'mousetrap';

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
        Mousetrap.bind(this.props.keys, () =>  {
            if (this.props.disabled !== true) {
                this.props.onPressed();
            }
        });
    }

    public componentWillUnmount() {
        Mousetrap.unbind(this.props.keys);
    }

    public render() {
        return null;
    }
}