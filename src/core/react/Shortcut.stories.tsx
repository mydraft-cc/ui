/*
 * Notifo.io
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Shortcut } from './Shortcut';

const meta: Meta<typeof Shortcut> = {
    component: Shortcut,
    render: (args) => {
        return (
            <>
                {args.keys}
    
                <Shortcut {...args} />
            </>
        );
    },
};

export default meta;
type Story = StoryObj<typeof Shortcut>;

export const Default: Story = {
    args: {
        keys: 'ctrl+s',
    },
};

export const ReadableKeys: Story = {
    args: {
        keys: 'CTRL + S',
    },
};