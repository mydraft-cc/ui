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

export const Shortcut = (props: ShortcutProps) => {
    const { keys, disabled, onPressed } = props;

    React.useEffect(() => {
        Mousetrap.bind(keys, (e) =>  {
            if (disabled !== true) {
                onPressed();

                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }

            return false;
        });

        return () => {
            Mousetrap.unbind(keys);
        };
    }, [keys]);

    return null as JSX.Element;
};