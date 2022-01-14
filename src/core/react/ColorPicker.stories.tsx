/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ComponentMeta } from '@storybook/react';
import * as React from 'react';
import { ColorPalette } from './../utils/color-palette';
import { ColorPicker } from './ColorPicker';

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

Default['argTypes'] = {
    palette: {
        table: {
            disable: true,
        },
    },
};
