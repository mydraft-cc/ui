/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { ComponentMeta } from '@storybook/react';
import { ColorPicker } from './ColorPicker';
import { ColorPalette } from './../utils/color-palette';

export default {
    component: ColorPicker,
} as ComponentMeta<typeof ColorPicker>;

const Template = ({ palette: _, ...rest }: any) => {
    const palette = ColorPalette.colors();

    return (
        <ColorPicker palette={palette} {...rest} />
    );
};

export const Default = Template.bind({});

Default.argTypes = {
    palette: {
        table: {
            disable: true,
        },
    },
};
