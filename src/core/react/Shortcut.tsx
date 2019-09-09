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

export const Shortcut = React.memo((props: ShortcutProps) => {
    const { keys, disabled, onPressed } = props;

    React.useEffect(() => {
        if (!disabled) {
            Mousetrap.bind(keys, (e) =>  {
                onPressed();

                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                return false;
            });

            return () => {
                Mousetrap.unbind(keys);
            };
        }

        return undefined;
    }, [disabled, keys]);

    return null;
});