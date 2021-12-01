/*
 * mydraft.cc
 *
 * @license
 * Copyright (c) Sebastian Stehle. All rights reserved.
*/

import { RendererService } from '@app/wireframes/model/renderer.service';
import { Browser, Button, ButtonBar, Checkbox, Comment, ComboBox, Dropdown, Heading, HorizontalLine, HorizontalScrollbar, Icon, Image, Label, Link, List, Numeric, Paragraph, Phone, Progress, RadioButton, Raster, Rectangle, Shape, Slider, Tablet, Tabs, TextArea, TextInput, Toggle, VerticalLine, VerticalScrollbar } from './dependencies';
import { AbstractControl } from './utils/abstract-control';

export function registerRenderers(): RendererService {
    return new RendererService()
        .addRenderer(new AbstractControl(new Browser()))
        .addRenderer(new AbstractControl(new Button()))
        .addRenderer(new AbstractControl(new ButtonBar()))
        .addRenderer(new AbstractControl(new Checkbox()))
        .addRenderer(new AbstractControl(new ComboBox()))
        .addRenderer(new AbstractControl(new Comment()))
        .addRenderer(new AbstractControl(new Dropdown()))
        .addRenderer(new AbstractControl(new Label()))
        .addRenderer(new AbstractControl(new Icon()))
        .addRenderer(new AbstractControl(new Image()))
        .addRenderer(new AbstractControl(new Heading()))
        .addRenderer(new AbstractControl(new HorizontalLine()))
        .addRenderer(new AbstractControl(new HorizontalScrollbar()))
        .addRenderer(new AbstractControl(new Link()))
        .addRenderer(new AbstractControl(new List()))
        .addRenderer(new AbstractControl(new Numeric()))
        .addRenderer(new AbstractControl(new Paragraph()))
        .addRenderer(new AbstractControl(new Phone()))
        .addRenderer(new AbstractControl(new Progress()))
        .addRenderer(new AbstractControl(new RadioButton()))
        .addRenderer(new AbstractControl(new Raster()))
        .addRenderer(new AbstractControl(new Rectangle()))
        .addRenderer(new AbstractControl(new Shape()))
        .addRenderer(new AbstractControl(new Slider()))
        .addRenderer(new AbstractControl(new TextArea()))
        .addRenderer(new AbstractControl(new TextInput()))
        .addRenderer(new AbstractControl(new Tablet()))
        .addRenderer(new AbstractControl(new Tabs()))
        .addRenderer(new AbstractControl(new Toggle()))
        .addRenderer(new AbstractControl(new VerticalLine()))
        .addRenderer(new AbstractControl(new VerticalScrollbar()));
}
