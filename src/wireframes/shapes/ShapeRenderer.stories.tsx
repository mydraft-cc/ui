/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import * as React from 'react';
import { ComponentMeta } from '@storybook/react';
import { ShapeRenderer } from './ShapeRenderer';
import * as Shapes from './dependencies';

export default {
    component: ShapeRenderer,
} as ComponentMeta<typeof ShapeRenderer>;

export const Browser = () => {
    return (
        <ShapeRenderer plugin={new Shapes.Browser()} />
    );
};

export const ButtonBar = () => {
    return (
        <ShapeRenderer plugin={new Shapes.ButtonBar()} />
    );
};

export const Button = () => {
    return (
        <ShapeRenderer plugin={new Shapes.Button()} />
    );
};

export const Checkbox = () => {
    return (
        <>
            <ShapeRenderer plugin={new Shapes.Checkbox()} appearance={{ STATE: 'Checked' }} />
            <ShapeRenderer plugin={new Shapes.Checkbox()} appearance={{ STATE: 'Normal' }} />
            <ShapeRenderer plugin={new Shapes.Checkbox()} appearance={{ STATE: 'Interdeminate' }} />
        </>
    );
};

export const ComboBox = () => {
    return (
        <ShapeRenderer plugin={new Shapes.ComboBox()} />
    );
};

export const Comment = () => {
    return (
        <ShapeRenderer plugin={new Shapes.Comment()} />
    );
};

export const Dropdown = () => {
    return (
        <ShapeRenderer plugin={new Shapes.Dropdown()} />
    );
};

export const Grid = () => {
    return (
        <ShapeRenderer plugin={new Shapes.Grid()} />
    );
};

export const Heading = () => {
    return (
        <ShapeRenderer plugin={new Shapes.Heading()} />
    );
};

export const HorizontalLine = () => {
    return (
        <ShapeRenderer plugin={new Shapes.HorizontalLine()} />
    );
};

export const HorizontalScrollbar = () => {
    return (
        <ShapeRenderer plugin={new Shapes.HorizontalScrollbar()} />
    );
};

export const Label = () => {
    return (
        <ShapeRenderer plugin={new Shapes.Label()} />
    );
};

export const Link = () => {
    return (
        <ShapeRenderer plugin={new Shapes.Link()} />
    );
};

export const List = () => {
    return (
        <ShapeRenderer plugin={new Shapes.List()} />
    );
};

export const Numeric = () => {
    return (
        <ShapeRenderer plugin={new Shapes.Numeric()} />
    );
};

export const Paragraph = () => {
    return (
        <ShapeRenderer plugin={new Shapes.Paragraph()} />
    );
};

export const Phone = () => {
    return (
        <ShapeRenderer plugin={new Shapes.Phone()} />
    );
};

export const Progress = () => {
    return (
        <ShapeRenderer plugin={new Shapes.Progress()} />
    );
};

export const RadioButton = () => {
    return (
        <>
            <ShapeRenderer plugin={new Shapes.RadioButton()} appearance={{ STATE: 'Checked' }} />
            <ShapeRenderer plugin={new Shapes.RadioButton()} appearance={{ STATE: 'Normal' }} />
        </>
    );
};

export const Shape = () => {
    return (
        <>
            <ShapeRenderer plugin={new Shapes.Shape()} appearance={{ SHAPE: 'Ellipse' }} />
            <ShapeRenderer plugin={new Shapes.Shape()} appearance={{ SHAPE: 'Rectangle' }} />
            <ShapeRenderer plugin={new Shapes.Shape()} appearance={{ SHAPE: 'Rhombus' }} />
            <ShapeRenderer plugin={new Shapes.Shape()} appearance={{ SHAPE: 'Rounded Rectangle' }} />
            <ShapeRenderer plugin={new Shapes.Shape()} appearance={{ SHAPE: 'Triangle' }} />
        </>
    );
};

export const Slider = () => {
    return (
        <ShapeRenderer plugin={new Shapes.Slider()} />
    );
};

export const Tabs = () => {
    return (
        <ShapeRenderer plugin={new Shapes.Tabs()} />
    );
};

export const TextArea = () => {
    return (
        <ShapeRenderer plugin={new Shapes.TextArea()} />
    );
};

export const TextInput = () => {
    return (
        <ShapeRenderer plugin={new Shapes.TextInput()} />
    );
};

export const Toggle = () => {
    return (
        <ShapeRenderer plugin={new Shapes.Toggle()} />
    );
};

export const ToggleUnchecked = () => {
    return (
        <>
            <ShapeRenderer plugin={new Shapes.Toggle()} appearance={{ STATE: 'Checked' }} />
            <ShapeRenderer plugin={new Shapes.Toggle()} appearance={{ STATE: 'Normal' }} />
        </>
    );
};

export const VerticalLine = () => {
    return (
        <ShapeRenderer plugin={new Shapes.VerticalLine()} />
    );
};

export const VerticalScrollbar = () => {
    return (
        <ShapeRenderer plugin={new Shapes.VerticalScrollbar()} />
    );
};
