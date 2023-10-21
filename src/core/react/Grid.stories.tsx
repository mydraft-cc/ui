/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { ComponentMeta } from '@storybook/react';
import { Grid } from './Grid';

export default {
    component: Grid,
} as ComponentMeta<typeof Grid>;

const items: number[] = [];

for (let i = 1; i <= 10000; i++) {
    items.push(i);
}

const renderer = (value: any) => {
    return (
        <div>{value}</div>
    );
};

const Template = () => {
    return (
        <div style={{ width: 200, height: 500, overflowX: 'hidden', overflowY: 'scroll' }}>
            <Grid columns={3} renderer={renderer} items={items} keyBuilder={x => x} />
        </div>
    );
};

export const Default = Template.bind({});
